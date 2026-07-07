import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

const createComment = async (req, res) => {
    try{
        const { postId, content, parentCommentId } = req.body;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({ message: "Post not found"});
        }

        const comment = await Comment.create({
            content,
            user: req.user.id,
            post: postId,
            parentComment: parentCommentId || null,
        });

        return res.status(201).json({
            message: "Comment created successfully",
            comment,
        })
    }catch(error){
        return res.status(500).json({ message: error.message });
    }
};

const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
            .populate("user", 'username avaterLeter')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({ commens });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);

        if(!comment){
            return res.status(400).jsoon({ message: "Comment not found" });
        }

        //ensure ownership
        if (comment.user.toString() !== req.user.id){
            return res.status(403).json({ message: "Unauthorized. Cannot perform this operation." });
        }

        await comment.deleteOne();

        return res.status(200).json({ message: "Comment deleted" });
    } catch(error) {
        return res.status(500).json({ message: error.message });
    }
};

const toggleLikeComment = async (req, res){
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment){
            return res.status(400).json({ message: "Comment not found" });
        }

        const userId = req.user.id;
        const alreadyLiked = comment.likes.includes(userId);

        if (alreadyLiked){
            comment.likes.pull(userId);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();

        return res.status(200).json({
            message: alreadyLiked ? "Unliked" : "Liked",
            likesCount: comment.likes.length,
        })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}