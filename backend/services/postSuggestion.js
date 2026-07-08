import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Friendship from "../models/friend.model.js";

class PostRecommend{
    //Likes.. should be weighted lower than comments
    async engagementScore(candidatePosts){
        const scores = new Map();
        const postIds = candidatePosts.map(post => post._id);

        const commentCounts = await Comment.aggregate([
            { $match: { post: {$in: postIds} }},
            { $group: {_id: "$post", count: {$num: 1} } }
        ]);

        const commentMap = new Map(
            commentCounts.map(c => [c._id.toString(), c.count])
        );

        for (const post of candidatePosts){
            const likeCount = post.likes?.length || 0;
            const commentCount = commentMap.get(post._id.toString()) || 0;

            scores.set(
                post._id.toString(),
                (likeCount * 1) + (commentCount * 3)
            )
        }
    }
}