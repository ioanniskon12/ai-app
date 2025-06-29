// src/lib/rateLimiter.js - Complete rate limiting implementation for AI Travel Planner

/**
 * In-memory rate limiter for development and fallback
 * For production, consider using Redis or a dedicated service
 */

const rateLimit = new Map();

/**
 * Simple rate limiter function
 * @param {string} identifier - Unique identifier (IP, user ID, etc.)
 * @param {number} limit - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Whether request is allowed
 */
export function rateLimiter(identifier, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing requests for this identifier
  const requests = rateLimit.get(identifier) || [];

  // Filter out requests outside the current window
  const validRequests = requests.filter((timestamp) => timestamp > windowStart);

  // Check if limit is exceeded
  if (validRequests.length >= limit) {
    // Update the map with filtered requests
    rateLimit.set(identifier, validRequests);
    return false; // Rate limit exceeded
  }

  // Add current request timestamp
  validRequests.push(now);
  rateLimit.set(identifier, validRequests);

  return true; // Request allowed
}

/**
 * Advanced rate limiter with different limits for different endpoints
 */
export class AdvancedRateLimiter {
  constructor() {
    this.limits = new Map();
    this.defaultConfig = {
      requests: 100,
      window: 900000, // 15 minutes
      blockDuration: 300000, // 5 minutes
    };

    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Set rate limit for specific endpoint
   */
  setLimit(endpoint, config) {
    this.limits.set(endpoint, {
      ...this.defaultConfig,
      ...config,
    });
  }

  /**
   * Check if request should be allowed
   */
  isAllowed(identifier, endpoint = "default") {
    const config = this.limits.get(endpoint) || this.defaultConfig;
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();

    if (!rateLimit.has(key)) {
      rateLimit.set(key, {
        requests: [],
        blockedUntil: null,
      });
    }

    const data = rateLimit.get(key);

    // Check if currently blocked
    if (data.blockedUntil && now < data.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.blockedUntil,
        blocked: true,
      };
    }

    // Reset block if expired
    if (data.blockedUntil && now >= data.blockedUntil) {
      data.blockedUntil = null;
      data.requests = [];
    }

    // Filter valid requests within window
    const windowStart = now - config.window;
    data.requests = data.requests.filter(
      (timestamp) => timestamp > windowStart
    );

    // Check if limit exceeded
    if (data.requests.length >= config.requests) {
      // Block for specified duration
      data.blockedUntil = now + config.blockDuration;
      rateLimit.set(key, data);

      return {
        allowed: false,
        remaining: 0,
        resetTime: data.blockedUntil,
        blocked: true,
      };
    }

    // Add current request
    data.requests.push(now);
    rateLimit.set(key, data);

    return {
      allowed: true,
      remaining: config.requests - data.requests.length,
      resetTime: windowStart + config.window,
      blocked: false,
    };
  }

  /**
   * Reset limits for a specific identifier/endpoint
   */
  reset(identifier, endpoint = "default") {
    const key = `${identifier}:${endpoint}`;
    rateLimit.delete(key);
  }

  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, data] of rateLimit.entries()) {
      if (data.requests && data.requests.length > 0) {
        const latestRequest = Math.max(...data.requests);
        if (
          latestRequest < cutoff &&
          (!data.blockedUntil || data.blockedUntil < now)
        ) {
          rateLimit.delete(key);
        }
      }
    }
  }
}

/**
 * User action rate limiter for specific user actions
 */
export class UserActionLimiter {
  constructor() {
    this.userLimits = new Map();
  }

  /**
   * Check if user action is allowed
   */
  checkUserAction(userId, action, limit = 10, windowMs = 60000) {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.userLimits.has(key)) {
      this.userLimits.set(key, []);
    }

    const actions = this.userLimits.get(key);
    const validActions = actions.filter((timestamp) => timestamp > windowStart);

    if (validActions.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowStart + windowMs,
      };
    }

    validActions.push(now);
    this.userLimits.set(key, validActions);

    return {
      allowed: true,
      remaining: limit - validActions.length,
      resetTime: windowStart + windowMs,
    };
  }

  /**
   * Reset limits for a specific user action
   */
  resetUserAction(userId, action) {
    const key = `${userId}:${action}`;
    this.userLimits.delete(key);
  }

  /**
   * Clean up old user actions
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, actions] of this.userLimits.entries()) {
      if (actions.length > 0) {
        const latestAction = Math.max(...actions);
        if (latestAction < cutoff) {
          this.userLimits.delete(key);
        }
      }
    }
  }
}

// Create global instances
export const advancedRateLimiter = new AdvancedRateLimiter();
export const userActionLimiter = new UserActionLimiter();

// Set up common endpoint limits
advancedRateLimiter.setLimit("auth", {
  requests: 5,
  window: 900000, // 15 minutes
  blockDuration: 1800000, // 30 minutes
});

advancedRateLimiter.setLimit("api", {
  requests: 100,
  window: 900000, // 15 minutes
  blockDuration: 300000, // 5 minutes
});

advancedRateLimiter.setLimit("search", {
  requests: 50,
  window: 300000, // 5 minutes
  blockDuration: 300000, // 5 minutes
});

advancedRateLimiter.setLimit("booking", {
  requests: 10,
  window: 600000, // 10 minutes
  blockDuration: 600000, // 10 minutes
});

// Clean up every hour
setInterval(() => {
  advancedRateLimiter.cleanup();
  userActionLimiter.cleanup();
}, 3600000);

/**
 * Redis-based rate limiter for production (optional)
 * Uncomment and configure if using Redis
 */

// Commented out to avoid build errors - install ioredis to use
// import Redis from "ioredis";

export class RedisRateLimiter {
  constructor(redisClient) {
    // For now, fall back to in-memory if Redis not available
    if (typeof window === "undefined" && process.env.REDIS_URL) {
      try {
        // Dynamically import Redis only on server-side
        import("ioredis")
          .then(({ default: Redis }) => {
            this.redis = redisClient || new Redis(process.env.REDIS_URL);
          })
          .catch(() => {
            console.warn("Redis not available - using in-memory rate limiting");
            this.redis = null;
          });
      } catch (error) {
        console.warn("Redis not available - using in-memory rate limiting");
        this.redis = null;
      }
    } else {
      this.redis = null;
    }
  }

  async isAllowed(identifier, limit = 100, windowMs = 900000) {
    // Fall back to in-memory if Redis not available
    if (!this.redis) {
      return {
        allowed: rateLimiter(identifier, limit, windowMs),
        remaining: limit,
        resetTime: Date.now() + windowMs,
        requestCount: 1,
      };
    }

    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const windowKey = `${key}:${window}`;

    try {
      const pipeline = this.redis.pipeline();
      pipeline.incr(windowKey);
      pipeline.expire(windowKey, Math.ceil(windowMs / 1000));

      const results = await pipeline.exec();
      const requestCount = results[0][1];

      if (requestCount > limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: (window + 1) * windowMs,
          requestCount,
        };
      }

      return {
        allowed: true,
        remaining: limit - requestCount,
        resetTime: (window + 1) * windowMs,
        requestCount,
      };
    } catch (error) {
      console.error("Redis rate limiter error:", error);
      // Fall back to allowing request on error
      return {
        allowed: true,
        remaining: limit,
        resetTime: Date.now() + windowMs,
        requestCount: 1,
      };
    }
  }

  async getStatus(identifier, windowMs = 900000) {
    if (!this.redis) {
      return {
        requestCount: 0,
        resetTime: Date.now() + windowMs,
      };
    }

    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const windowKey = `${key}:${window}`;

    try {
      const requestCount = (await this.redis.get(windowKey)) || 0;

      return {
        requestCount: parseInt(requestCount),
        resetTime: (window + 1) * windowMs,
      };
    } catch (error) {
      console.error("Redis rate limiter status error:", error);
      return {
        requestCount: 0,
        resetTime: Date.now() + windowMs,
      };
    }
  }
}

/**
 * Middleware helper for Express/Next.js API routes
 */
export function createRateLimitMiddleware(options = {}) {
  const {
    limit = 100,
    windowMs = 900000, // 15 minutes
    keyGenerator = (req) =>
      req.ip || req.connection?.remoteAddress || "anonymous",
    message = "Too many requests, please try again later.",
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  return async (req, res, next) => {
    const key = keyGenerator(req);
    const result = rateLimiter(key, limit, windowMs);

    if (standardHeaders) {
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", result ? limit - 1 : 0);
      res.setHeader(
        "X-RateLimit-Reset",
        Math.ceil((Date.now() + windowMs) / 1000)
      );
    }

    if (legacyHeaders) {
      res.setHeader("X-Rate-Limit-Limit", limit);
      res.setHeader("X-Rate-Limit-Remaining", result ? limit - 1 : 0);
      res.setHeader(
        "X-Rate-Limit-Reset",
        Math.ceil((Date.now() + windowMs) / 1000)
      );
    }

    if (!result) {
      if (typeof res.status === "function") {
        // Express-style response
        return res.status(429).json({ error: message });
      } else {
        // Next.js API route style
        res.statusCode = 429;
        res.end(JSON.stringify({ error: message }));
        return;
      }
    }

    if (next) {
      next();
    }
  };
}

/**
 * Utility function to get client IP address
 */
export function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
    "anonymous"
  );
}

/**
 * Default rate limiter instance for easy use
 */
export default rateLimiter;
