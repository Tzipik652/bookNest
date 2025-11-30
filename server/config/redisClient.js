import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();
const portNumber = Number(process.env.REDIS_PORT);
if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
  throw new Error(`REDIS_PORT is invalid: ${process.env.REDIS_PORT}`);
}

const redisClient = createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${portNumber}`,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

await redisClient.set("foo", "bar");
const result = await redisClient.get("foo");
console.log(result); // >>> bar

export default redisClient;
