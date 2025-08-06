const { redisClient } = require('../config/database');

class RateLimiter {
  constructor() {
    this.MESSAGE_LIMIT_KEY = 'rate_limit:messages:';
    this.CONNECTION_LIMIT_KEY = 'rate_limit:connections:';
  }

  // Rate limit messages per user
  async checkMessageRate(socketId, limit = 30, windowMs = 60000) { // 30 messages per minute
    const key = `${this.MESSAGE_LIMIT_KEY}${socketId}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove expired entries
      await redisClient.zremrangebyscore(key, 0, windowStart);
      
      // Count current messages in window
      const count = await redisClient.zcard(key);
      
      if (count >= limit) {
        return { allowed: false, retryAfter: windowMs / 1000 };
      }

      // Add current request
      await redisClient.zadd(key, now, `${now}-${Math.random()}`);
      await redisClient.expire(key, Math.ceil(windowMs / 1000));

      return { allowed: true, remaining: limit - count - 1 };
    } catch (error) {
      console.error('Rate limiter error:', error);
      return { allowed: true }; // Fail open
    }
  }

  // Rate limit connections per IP
  async checkConnectionRate(ipAddress, limit = 5, windowMs = 60000) { // 5 connections per minute per IP
    const key = `${this.CONNECTION_LIMIT_KEY}${ipAddress}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      await redisClient.zremrangebyscore(key, 0, windowStart);
      const count = await redisClient.zcard(key);
      
      if (count >= limit) {
        return { allowed: false, retryAfter: windowMs / 1000 };
      }

      await redisClient.zadd(key, now, `${now}-${Math.random()}`);
      await redisClient.expire(key, Math.ceil(windowMs / 1000));

      return { allowed: true, remaining: limit - count - 1 };
    } catch (error) {
      console.error('Connection rate limiter error:', error);
      return { allowed: true };
    }
  }

  // Detect and prevent spam
  async detectSpam(socketId, message) {
    const spamKey = `spam_detection:${socketId}`;
    
    try {
      // Get recent messages
      const recentMessages = await redisClient.lrange(spamKey, 0, 4); // Last 5 messages
      
      // Check for repeated messages
      const duplicateCount = recentMessages.filter(msg => msg === message).length;
      if (duplicateCount >= 3) {
        return { isSpam: true, reason: 'Repeated message' };
      }
      
      // Check for rapid fire (same length messages)
      if (recentMessages.length >= 5 && recentMessages.every(msg => Math.abs(msg.length - message.length) < 5)) {
        return { isSpam: true, reason: 'Rapid fire detected' };
      }
      
      // Store message
      await redisClient.lpush(spamKey, message);
      await redisClient.ltrim(spamKey, 0, 9); // Keep last 10 messages
      await redisClient.expire(spamKey, 300); // 5 minutes
      
      return { isSpam: false };
    } catch (error) {
      console.error('Spam detection error:', error);
      return { isSpam: false };
    }
  }

  // Block user temporarily
  async blockUser(socketId, durationMs = 5 * 60 * 1000) { // 5 minutes default
    const blockKey = `blocked_users:${socketId}`;
    await redisClient.setex(blockKey, Math.ceil(durationMs / 1000), 'blocked');
  }

  // Check if user is blocked
  async isUserBlocked(socketId) {
    const blockKey = `blocked_users:${socketId}`;
    const isBlocked = await redisClient.exists(blockKey);
    return isBlocked === 1;
  }
}

// Middleware for Express routes
const createRateLimitMiddleware = (limit = 100, windowMs = 60000) => {
  const rateLimiter = new RateLimiter();
  
  return async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await rateLimiter.checkConnectionRate(ipAddress, limit, windowMs);
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: result.retryAfter
      });
    }
    
    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': result.remaining || 0,
      'X-RateLimit-Reset': Date.now() + windowMs
    });
    
    next();
  };
};

module.exports = { RateLimiter, createRateLimitMiddleware };
