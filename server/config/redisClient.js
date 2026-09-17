import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL || (() => {
  const portNumber = Number(process.env.REDIS_PORT);
  if (!process.env.REDIS_HOST || !process.env.REDIS_PASSWORD || !Number.isInteger(portNumber) || portNumber <= 0 || portNumber > 65535) {
    return null;
  }

  return `redis://default:${encodeURIComponent(process.env.REDIS_PASSWORD)}@${process.env.REDIS_HOST}:${portNumber}`;
})();

const redisClient = createClient({
  ...(redisUrl ? { url: redisUrl } : {}),
  socket: {
    connectTimeout: 500,
    reconnectStrategy: (retries) => {
      if (retries >= 2) return new Error("Redis reconnect limit reached");
      return 100;
    },
  },
  disableOfflineQueue: true,
});

redisClient.on("error", (error) => {
  console.warn("Redis unavailable; continuing without cache:", error.message);
});

if (redisUrl) {
  redisClient.connect().catch((error) => {
    console.warn("Redis connection failed; continuing without cache:", error.message);
  });
} else {
  console.warn("Redis is not configured; continuing without cache.");
}

export default redisClient;
