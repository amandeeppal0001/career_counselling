import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    tls: process.env.REDIS_URL && process.env.REDIS_URL.startsWith('rediss://')
  }
});

redisClient.on('error', (err) => console.log('Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect immediately, but wrap in try/catch to not crash the server if Redis is down locally.
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis initially. Continuing without cache...');
  }
})();

export default redisClient;
