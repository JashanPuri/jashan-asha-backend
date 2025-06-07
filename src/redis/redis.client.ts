import Redis from "ioredis";

export class RedisClient {
  private client: Redis;

  constructor() {
    console.log("Connecting to Redis", process.env.REDIS_URL);
    this.client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });

    this.client.on("error", (err: Error) => {
      console.error("Redis Client Error:", err);
    });

    this.client.on("connect", () => {
      console.log("Redis Client Connected");
    });

    this.client.on("reconnecting", () => {
      console.log("Redis Client Reconnecting");
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttl?: number): Promise<string | null> {
    if (ttl) {
      return await this.client.set(key, value, "EX", ttl);
    }
    return await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async delete(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async disconnect(): Promise<"OK"> {
    return await this.client.quit();
  }
}

export const redisClient = new RedisClient();
