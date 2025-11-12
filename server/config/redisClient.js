import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://red-xxxxxxx.internal:6379',
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
await redisClient.connect();

export default redisClient;
