import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://red-xxxxxxx.internal:6379",
  socket: {
    tls: true,

    rejectUnauthorized: false, // מבטל בדיקה של התעודה
  },
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log("Redis connected"));

await redisClient.connect();

export default redisClient;
