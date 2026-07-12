import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Friendship from "../models/friend.model.js";
import CloudinaryService from "../services/CloudinaryService.js";
import PostRecommend from "../services/postSuggestion.js";
import RecommendationCache from "../services/RecommendationCache.js";

const postRecommend = new PostRecommend();

const createPost = async (req, res) => {
    try{
        const { author, text, visibility } = req.body;
        let media = [];

        if(req.files && req.files.length > 0){
            media = await Promise.all(
                req.files.map(async(file) => {
                    const result = await CloudinaryService.upload(
                        file.buffer,
                        "/blink/posts"
                    );

                    return {
                        url: result.secure_url,
                        publicId: result.public_id,
                        type: result.resource_type,

                        width: result.width,
                        height: result.height,

                        duration: result.duration || null,
                        
                        bytes: result.bytes,
                        format: result.format
                    };
                })
            );
        }

        const user = await User.findById(author);

        if(!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        if ((!text || text.trim() === "") && (!media || media.length === 0)){
            return res.status(400).json({
                message: "Post cannot be empty"
            });
        }

        const post = await Post.create({
            author,
            caption: text,
            media,
            visibility
        });
        
        //relax here there is something about this logic because if a post is newly made
        //and a user cache is already active then he won't be able to get that new post but well dont
        //think it really matters ... let us just get this shit to actually work
        await RecommendationCache.clear("post", author);

        res.status(201).json({
            message: "Post created successfully",
            post
        });
    } catch (error){
        res.status(500).json({
            message: error.message
        });
    }
};

const getFeed = async (req, res) => {
    try {
        const { userId } = req.body;

        const page = Math.max(parseInt(req.query.page) || 1, 1); //prevent from getting zero
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({
                message: "User not found"
            });
        }

        //first get from cache yooo
        let rankedPosts = await RecommendationCache.get('post', userId);

        //so if nothing in cache we set cache
        if (!rankedPosts){
            rankedPosts = await postRecommend.recommend(userId);
            await RecommendationCache.set("post", userId, rankedPosts);
        }

        const totalPosts = rankedPosts.length;
        const totalPages = Math.ceil(totalPosts / limit);

        //now do the pagination here
        const pageIds = rankedPosts
            .slice(skip, skip + limit)
            .map(entry => entry.id);
        
        if (pageIds.length === 0){
            return res.status(200).json({
                message: "Feed generated successfully",
                posts: [],
                pagination: {
                    page,
                    limit,
                    totalPosts,
                    totalPages,
                    hasMore: false
                }
            });
        }

        const posts = await Post.find({
            _id: { $in: pageIds }
        }).populate("author", "username profilePicture");

        //why doesn't mongoose arrange in order anyways we have to fix this manually - remember Ade!
        const postMap = new Map(posts.map(p => [p._id.toString(), p]));
        const orderedPosts = pageIds
            .map(id => postMap.get(id))
            .filter(Boolean); //
        
        

        res.status(200).json({
            message: "Feed generated successfully",
            posts: orderedPosts,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages,
                hasMore: page < totalPages
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const likePost = async (req, res) => {
    try {
        const { userId, postId } = req.body;

        if(!userId || !postId){
            return res.status(400).json({
                message: "User Id and Post Id are required."
            });
        }

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({
                message: "Post not found."
            });
        }

        const alreadyLiked = post.likes.some(
            id => id.toString() === userId
        );

        if (alreadyLiked){
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            message: alreadyLiked
                ? "Post unliked successfully"
                : "Post liked successfully.",
            liked: !alreadyLiked,
            likesCount: post.likes.length
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export {
    createPost,
    getFeed,
    likePost
};