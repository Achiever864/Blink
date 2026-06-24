import User from "../models/user.model";

class Friends {
    myFriendScore(userId){
        const friends = await User.findById(userId).select("friends");

        const mutualCounts = new Map();

        for (const friendid of friends){
            const friend = await User.findById(friendId);

            for (const candidateid of friend.friends){
                if (candidateid.equals(userId) || friends.some(id => id.equals(candidateId))){
                    continue;
                }

                mutualCounts.set(
                    candidateId.toString(),
                    (mutualCounts.get(candidateId.toString()) || 0) + 1
                );
            }
        }
        return mutualCounts;
    }
}