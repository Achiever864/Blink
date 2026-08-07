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
            { $group: {_id: "$post", count: {$sum: 1} } }
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
        const halfLifeHours = 24;
        const maxScore = 30; 

        for (const post of candidatePosts){
            const ageHours = (now - new Date(post.createdAt).getTime())/ (1000 * 60 * 60);
            const decayFactor = Math.pow(0.5, ageHours / halfLifeHours);

            scores.set(post._id.toString(), decayFactor * maxScore);
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
            const totalEngagement = likeCount + commentCount;

            scores.set(
                post._id.toString(),
                (totalEngagement / ageHours) * 5
            );
        }

        return scores;
    }

    async authorAffinityScores(userId, candidatePosts){
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

    randomnessScore(candidatePosts, magnitude = 6){
        const scores = new Map();

        for (const post of candidatePosts){
            scores.set(post._id.toString(), Math.random() * magnitude);
        }

        return scores;
    }

    stalenessMultiplier(candidatePosts, halfLifeHours = 30){
        const multipliers = new Map();
        const now = Date.now();

        for (const post of candidatePosts){
            const ageHours = (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
            multipliers.set(
                post._id.toString(),
                Math.pow(0.5, ageHours / halfLifeHours)
            );
        }

        return multipliers;
    }

    //prevents one user from flooding the feed
    authorDiversityPenalty(candidatePosts, sortedPostIds){
        const postById = new Map(candidatePosts.map(p => [p._id.toString(), p]));
        const authorSeenCount = new Map();
        const penalties = new Map();

        for (const postId of sortedPostIds){
            const post = postById.get(postId);
            if (!post) continue;

            const authorId = post.author.toString();
            const seenCount = authorSeenCount.get(authorId) || 0;

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

        
        const friendships = await Friendship.find({
            status: "accepted",
            $or: [{ requester: userId }, { recipient: userId }]
        });

        const friendIds = friendships.map(f =>
            f.requester.toString() === userId.toString() ? f.recipient : f.requester
        );

        const candidatePosts = await Post.find({
            $or: [
                { visibility: "public" },
                { visibility: "friends", author: { $in: friendIds } },
                { author: userId }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(200);  //we want to cap at 200 for performance before scoring

        if (candidatePosts.length === 0) return [];

        const postIds = candidatePosts.map(post => post._id);
        const commentCounts = await Comment.aggregate([
            { $match: {post: { $in: postIds } } },
            { $group: {_id: "$post", count: { $sum: 1 } } }
        ]);

        const commentMap = new Map(
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
        const randomnessScores = this.randomnessScore(candidatePosts);

        const finalScores = new Map();
        this.mergeScores(finalScores, engagementScores);
        this.mergeScores(finalScores, recencyScores);
        this.mergeScores(finalScores, velocityScores);
        this.mergeScores(finalScores, authorAffinityScores);
        this.mergeScores(finalScores, interestScores);
        this.mergeScores(finalScores, randomnessScores);

        const stalenessMultipliers = this.stalenessMultiplier(candidatePosts);
        for (const [postId, score] of finalScores){
            finalScores.set(postId, score * (stalenessMultipliers.get(postId) ?? 1));
        }

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