import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Friendship from "../models/friend.model.js";


const createPost = async () => {
    try{
        const { author, text, media, visibility } = req.body;

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
            text,
            media,
            visibility
        });

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
        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({
                message: "User not found"
            });
        }

        const friendships = await Friendship.find({
            status: "accepted",
            $or: [
                { requester: userId },
                { recipient: userId }
            ]
        });

        const friendIds = friendships.map(friend => {
            if(friend.requester.toString() === userId){
                return friend.recipient;
            }

            return friend.requester;
        });

        friendIds.push(userId);

        const posts = await Post.find({
            author: {
                $in: friendIds
            }
        })
        .populate("author", "username profilePicture")
        .sort({
            createdAt: -1
        });

        res.status(200).json({
            message: "Feed generated successfully",
            posts
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export {
    createPost,
    getFeed
};