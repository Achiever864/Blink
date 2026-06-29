import User from "../models/user.model.js";

class FriendsRecommend {
    async mutualFriendScore(userId){
        const user = await User.findById(userId).select("friends");

        if(!user){
            throw new Error("User not found");
        }

        const friends = user.friends;

        const mutualCounts = new Map();

        for (const friendId of friends){
            const friend = await User.findById(friendId);

            if(!friend) continue;

            for (const candidateId of friend.friends){
                if (candidateId.equals(userId) || friends.some(id => id.equals(candidateId))){
                    continue;
                }

                mutualCounts.set(
                    candidateId.toString(),
                    (mutualCounts.get(candidateId.toString()) || 0) + 1
                );
            }
        }

        console.log(mutualCounts);
        return mutualCounts;
    }


    async occupationScore(userId){
        const user = await User.findById(userId);

        if(!user){
            throw new Error("User not found");
        }

        const candidates = await User.find({
            occupation: user.occupation,
            _id: { 
                $nin: [...user.friends, userId]
            }
        });

        const scores = new Map();

        for (const candidate of candidates){
            scores.set(candidate._id.toString(), 5);
        }

        return scores;
    }


    async interestScore(userId){
        const user = await User.findById(userId);

        if(!user){
            throw new Error("User not found");
        }

        if(!user.interests || user.interests.length === 0){
            return new Map();
        }

        const candidates = await User.find({
            interests: {
                $in: user.interests
            },
            _id: {
                $nin: [...user.friends, userId]
            }
        });

        const scores = new Map();
        
        for(const candidate of candidates){
            const commonInterests = candidate.interests.filter(interest =>
                user.interests.includes(interest)
            );

            scores.set(
                candidate._id.toString(),
                commonInterests.length * 3
            );
        }

        return scores;
    }

    async recentUsersScore(userId){
        const user = await User.findById(userId);

        if(!user) {
            throw new Error("User not found");
        }

        const candidates = await User.find({
            _id: {
                $nin: [...user.friends, userId]
            }
        })
        .sort({createdAt: -1})
        .limit(50)

        const scores = new Map();

        let score = 10;
        for (const candidate of candidates){
            scores.set(candidate._id.toString(), score);

            if (score>1) score--;
        }

        return scores;
    }


    async popularUsersScore(userId){
        const user = await User.findById(userId);

        if(!user){
            throw new Error("User not found");
        }

        const candidates = await User.find({
            _id: {
                $nin: [...user.friends, userId]
            }
        }).select("friends");

        const scores = new Map();

        for (const candidate of candidates){
            const popularityScore = Math.min(
                Math.floor(candidate.friends.length/10),
                20
            );

            scores.set(
                candidate._id.toString(),
                popularityScore
            );
        }

        return scores;
    }

    async locationScore(userId){
        const user = await User.findById(userId);

        if(!user){
            throw new Error("User not found")
        }


        const conditions = [];
        
        if(user.city){
            conditions.push({city: user.city});
        }

        if(user.nationality){
            conditions.push({ nationality: user.nationality })
        }

        if (conditions.length === 0){
            return new Map();
        }

        const candidates = await User.find({
            _id: {
                $nin: [...user.friends, userId]
            },
            $or: conditions
        });

        const scores = new Map();

        for(const candidate of candidates){
            let score = 0;
            if(user.city && candidate.city === user.city){
                score += 8;
            }

            if(user.nationality && candidate.nationality === user.nationality){
                score += 3;
            }

            scores.set(candidate._id.toString(), score);
        }

        return scores;
    }

    //Let's merge to get a final score
    mergeScores(finalScores, newScores){
        for(const [userId, score] of newScores){
            finalScores.set(
                userId,
                (finalScores.get(userId) || 0) + score
            );
        }
    }

    async recommend(userId) {
        const[
            mutualScores,
            occupationScores,
            interestScores,
            recentScores,
            popularScores,
            locationScores
        ] = await Promise.all([
            this.mutualFriendScore(userId),
            this.occupationScore(userId),
            this.interestScore(userId),
            this.recentUsersScore(userId),
            this.popularUsersScore(userId),
            this.locationScore(userId)
        ]);

        const finalScores = new Map();

        this.mergeScores(finalScores, mutualScores);
        this.mergeScores(finalScores, occupationScores);
        this.mergeScores(finalScores, interestScores);
        this.mergeScores(finalScores, recentScores);
        this.mergeScores(finalScores, popularScores);
        this.mergeScores(finalScores, locationScores);

        const sortedScores = [...finalScores.entries()].sort(
            (a,b) => b[1] - a[1]
        );


        //restore order of the fetched user
        const orderedUsers = sortedScores.map(([id, score]) => ({
            id,
            score
        }));

        return orderedUsers;
    }
}

export default FriendsRecommend;