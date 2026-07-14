import redis from "../config/redis.js";

class RecommendationCache {
    key(type, userId){
        return `recommendations:${type}:${userId}`;
    }

    async get(type, userId){
        const data = await redis.get(this.key(type, userId));

        return data ? JSON.parse(data) : null;
    }

    async set(type, userId, recommendations){
        await redis.set(
            this.key(type, userId),
            JSON.stringify(recommendations),
            {
                EX: 60 * 30
            }
        );
    }

    async clear(type, userId){
        await redis.del(this.key(type, userId));
    }
}

export default new RecommendationCache();