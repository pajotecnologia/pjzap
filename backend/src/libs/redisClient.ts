import Redis from "ioredis";
import { REDIS_URI_CONNECTION } from "../config/redis";
import { logger } from "../utils/logger";

let client: any;

try {
  const uri = REDIS_URI_CONNECTION || "redis://127.0.0.1:6379";
  client = new Redis(uri, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false
  });

  client.on("error", (err: any) => {
    logger.error(`[Redis Client] Erro de conexão: ${err.message}`);
  });
  
  client.on("connect", () => {
    logger.info("[Redis Client] Conectado com sucesso!");
  });
} catch (e: any) {
  logger.error(`[Redis Client] Falha crítica ao inicializar: ${e.message}`);
  throw e;
}

export const getRedisClient = () => {
  return client;
};

export default client;
