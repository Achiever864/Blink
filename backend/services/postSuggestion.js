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
            { $group: {_id: "$post", count: {$nin: 1} } }
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
            );
        }
        return scores;
    }

    recencyScore(candidatePosts){
        const scores = new Map();
        const now = Date.now();
        const halfLifeHours = 48; //hmmm nice idea... scores halves every 48 hours, beautiful

        for (const post of candidatePosts){
            const ageHours = (now - new Date(post.createdAt).getTime())/ (1000 * 60 * 60);
            const decayFactor = Math.pow(0.5, ageHours / halfLifeHours);

            scores.set(post._id.toString(), decayFactor * 15);
        }

        return scores;
    }

    async velocityScore(candidatePosts, commentMap){
        const scores = new Map();
        const now = Date.now();

        for (const post of candidatePosts){
            const ageHours = Math.max(
                (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60),
                1 //avoid divide by zero on very recent post
            );

            const likeCount = post.likes?.length || 0;
            const commentCount = commentMap.get(post._id.toString()) || 0;
            const totalEngagement = likeCount + commonCount;

            scores.set(
                post._id.toString(),
                (totalEngagement / ageHours) * 5
            );
        }

        return scores;
    }

    async authorffinityScore(userId, candidatePosts){
        const user = await User.findById(userId).select("friends");

        if (!user) throw new Error("User not found");

        const friendIds = new Set(user.friends.map(id => id.toString()));

        const scores = new Map();

        for (const post of candidatePosts){
            const authorId = post.author.toString();

            if (friendIds.has(authorId)){
                scores.set(post._id.toString(), 10);
            }
        }
        return scores;
    }

    interestScore(user, candidatePosts){
        const scores = new Map();

        if (!user.interests || user.interests.length === 0){
            return scores;
        }

        for (const post of candidatePosts){
            if (!post.tags || post.tags.length === 0) continue;

            const commonTags = post.tags.filter(tag =>
                user.interests.includes(tag)
            );

            if(commonTags.length > 0){
                scores.set(post._id.toString(), commonTags.length * 4);
            }
        }
        return scores;
    }

    //prevents one user from flooding the feed
    authorDiversityPenalty(candidatePosts, sortedPostIds){
        const postById = new Map(candidatePosts.map(p => [p._id.toString(), p]));
        const authorSeenCount = new Map();
        const penalties = new Map();

        for (const postId of sortedPostIds){
            const post = postById.get(psotId);
            if (!post) continue;

            const authorId = post.author.toString();
            const seenCount = authorSeenCount.get(authorId) || 0;

            //each repeat appearance from the same author gets progressively penalized
            penalties.set(postId, seenCount * 6);
            authorSeenCount.set(authorId, seenCount + 1);
        }

        return penalties;
    }

    mergeScores(finalScores, newScores){
        for (const [postId, score] of newScores){
            finalScores.set(
                postId,
                (finalScores.get(postId) || 0) +  score
            );
        }
    }

    async recommend(userId){
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        //pull in friends + friends of friends as your candidate posts as candidate pool,
        //same $nin exclusion pattern as FriendRecommend, but here we want visibility filtering too
        const friendships = await Friendship.find({
            status: "accepted",
            $or: [{ requester: userId }, { recipient: userId }]
        });

        const friendIds = friendships.map(f =>
            f.requester.toString() === userId.toString() ? f.recipient : f.requester
        );

        const candidatePosts = await Post.find({
            author: { $in: [...friendIds, userId] },
            visibility: { $ne: "private" }
        }).limit(200); //well.. we want to cap candidate pool for performance before scoring

        if (candidatePosts.length === 0) return [];

        const postIds = candidatePosts.map(post => post._id);
        const commentCounts = await Comment.aggregate([
            { $match: {psot: { $in: postIds } } },
            { $group: {_id: "$post", count: { $sum: 1 } } }
        ]);

        const commmentMap = new Map(
            commentCounts.map(c => [c._id.toString(), c.count])
        );

        const [
            engagementScores,
            recencyScores,
            velocityScores,
            authorAffinityScores
        ] = await Promise.all([
            this.engagementScore(candidatePosts),
            this.recencyScore(candidatePosts),
            this.velocityScore(candidatePosts, commentMap),
            this.authorAffinityScores(userId, candidatePosts)
        ]);

        const interestScores = this.interestScore(user, candidatePosts);

        const finalScores = new Map();
        this.mergeScores(finalScores, engagementScores);
        this.mergeScores(finalScores, recencyScores);
        this.mergeScores(finalScores, velocityScores);
        this.mergeScores(finalScores, authorAffinityScores);
        this.mergeScores(finalScores, interestScores);

        let sortedScores = [...finalScores.entries()].sort((a,b) => b[1] - a[1]);

        //apply the author diversity penalty after initial sort, then we have to re-sort
        const diversityPenalties = this.authorDiversityPenalty(
            candidatePosts,
            sortedScores.map(([id]) => id)
        );

        sortedScores = sortedScores.map(([id, score]) => [
            id,
            score - (diversityPenalties.get(id) || 0)
        ]).sort((a,b) => b[1] - a[1]);

        return sortedScores.map(([id, score]) => ({ id, score }));
    }
}

export default PostRecommend;