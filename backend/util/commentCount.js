// utils/postCommentCount.js
import Post from "../models/post.model.js";

export const incrementCommentCount = async (postId) => {
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
};

export const decrementCommentCount = async (postId) => {
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });
};