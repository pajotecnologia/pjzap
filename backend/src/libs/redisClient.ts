import Redis from "ioredis";
import RedisMock from "ioredis-mock";
import { REDIS_URI_CONNECTION } from "../config/redis";

let client: any;

try {
  const uri = REDIS_URI_CONNECTION || "redis://127.0.0.1:6379";
  client = new Redis(uri, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy: () => null
  });

  client.on("error", (err: any) => {
    if (err.code === "ECONNREFUSED") {
      // Usar mock em caso de falha de conexão local
      client = new RedisMock();
    }
  });
} catch (e) {
  client = new RedisMock();
}

export const getRedisClient = () => {
  return client || new RedisMock();
};

export default client;
