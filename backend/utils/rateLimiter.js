const rateLimitStore = new Map();

export const createRateLimiter = ({ windowMs = 60000, max = 10, message = "Too many requests. Please try again later." } = {}) => {
  const cleanupInterval = windowMs * 2;

  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.expiresAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  };

  setInterval(cleanup, cleanupInterval).unref();

  return (req, res, next) => {
    const identifier = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || entry.expiresAt <= now) {
      rateLimitStore.set(identifier, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: message, retryAfter: Math.ceil((entry.expiresAt - now) / 1000) });
    }

    return next();
  };
};
