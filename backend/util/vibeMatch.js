const calculateVibeScore = (userA, userB) => {
    let score = 0;

    //shared interests (cap at 40%)
    const interestsA = new Set(
        (userA.interests || []).map(i => i.toLowerCase())
    );

    const interestsB = new Set(
        (userB.interests || []).map(i => i.toLowerCase())
    );

    const sharedInterests = [...interestsA].filter(i =>
        interestsB.has(i)
    );

    score += Math.min(sharedInterests.length * 10, 40);

    //same occupation (cap at 15)
    if(
        userA.occupation &&
        userB.occupation &&
        userA.occupation.toLowerCase() === userB.occupation.toLowerCase()
    ) {
        score += 15
    }

    //same city (cap at 20)
    if(
        userA.city &&
        userB.city &&
        userA.city.toLowerCase() === userB.city.toLowerCase()
    ) {
        score += 20;
    }

    //same nationality (cap at 10)
    if(
        userA.nationality &&
        userB.nationality &&
        userA.nationality.toLowerCase() === userB.nationality.toLowerCase()
    ){
        score += 10;
    }

    //Mutual friends (cap at 15)
    //remember that this isn't working fully yet because the friends field in our user model wasnt used
    //instead we have to calculate the mutual friends from the friends model.. so add later
    const friendsA = new Set(
        (userA.friends || []).map(String)
    );

    const mutualFriends = (userB.friends || []).filter(friend =>
        friendsA.has(friend.toString())
    );

    score += Math.min(mutualFriends.length * 3, 15);
    return Math.min(score, 100);
};

//we want to return some metadata relating to how we calculated the vibe score... add later
export default calculateVibeScore;