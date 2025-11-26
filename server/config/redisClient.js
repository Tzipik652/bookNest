import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.REDIS_URL) {
  throw new Error("❌ Missing REDIS_URL in environment variables.");
}
const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    // rejectUnauthorized: false, // מבטל בדיקה של התעודה
  reconnectStrategy: () => 2000,
  },
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log("Redis connected"));

await redisClient.connect();

export default redisClient;
