//import redis from "../config/redis.js";

class RecommendationCache {
    key(userId){
        return `recommendations: ${userId}`;
    }

    async get(userId){
        const data = await redis.get(this.key(userId));

        return data ? JSON.parse(data) : null;
    }

    async set(userId, recommendations){
        await redis.set(
            this.key(userId),
            JSON.stringify(recommendations),
            {
                EX: 60 * 30
            }
        );
    }

    async clear(userId){
        await redis.del(this.key(userId));
    }
}

export default new RecommendationCache();