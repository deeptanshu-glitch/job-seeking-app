import IORedis from 'ioredis';

let redis = null;
if (process.env.REDIS_URL) {
  redis = new IORedis(process.env.REDIS_URL);

  redis.on('error', (err) => {
    console.warn('[ioredis] connection error:', err && err.message ? err.message : err);
  });
  redis.on('connect', () => {
    console.info('[ioredis] connected');
  });
}

export const createRedisRateLimiter = ({ windowMs = 60000, max = 100, prefix = 'rl:' } = {}) => {
  if (!redis) return (req, res, next) => next();

  return async (req, res, next) => {
    try {
      const id = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const key = `${prefix}${id}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }
      if (count > max) {
        const ttl = await redis.pttl(key);
        return res.status(429).json({ success: false, error: 'Too many requests', retryAfter: Math.ceil(ttl / 1000) });
      }
      return next();
    } catch (err) {
      console.warn('Redis limiter error, skipping limiter:', err.message || err);
      return next();
    }
  };
};
