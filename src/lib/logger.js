// lib/logger.js - Enhanced error logging and monitoring

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Log levels for different types of messages
 */
const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level, message, context = null) => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
  return `[${timestamp}] ${level}: ${message}${contextStr}`;
};

/**
 * Get emoji for log level
 */
const getLogEmoji = (level) => {
  switch (level) {
    case LOG_LEVELS.ERROR:
      return "❌";
    case LOG_LEVELS.WARN:
      return "⚠️";
    case LOG_LEVELS.INFO:
      return "ℹ️";
    case LOG_LEVELS.DEBUG:
      return "🔍";
    default:
      return "📝";
  }
};

/**
 * Enhanced logger with multiple output methods
 */
export const logger = {
  /**
   * Log error messages
   */
  error: (message, error = null, context = null) => {
    const emoji = getLogEmoji(LOG_LEVELS.ERROR);
    const logMessage = formatMessage(LOG_LEVELS.ERROR, message, context);

    console.error(`${emoji} ${logMessage}`);

    if (error) {
      console.error("Error details:", error);

      // Log stack trace in development
      if (isDevelopment && error.stack) {
        console.error("Stack trace:", error.stack);
      }
    }

    // In production, you might want to send to an error tracking service
    if (isProduction && error) {
      // Example integrations:
      // Sentry.captureException(error, { extra: context });
      // LogRocket.captureException(error);
      // Bugsnag.notify(error, { metadata: context });
    }
  },

  /**
   * Log warning messages
   */
  warn: (message, data = null) => {
    const emoji = getLogEmoji(LOG_LEVELS.WARN);
    const logMessage = formatMessage(LOG_LEVELS.WARN, message, data);

    console.warn(`${emoji} ${logMessage}`);

    if (data && isDevelopment) {
      console.warn("Warning data:", data);
    }
  },

  /**
   * Log info messages
   */
  info: (message, data = null) => {
    const emoji = getLogEmoji(LOG_LEVELS.INFO);
    const logMessage = formatMessage(LOG_LEVELS.INFO, message, data);

    console.log(`${emoji} ${logMessage}`);

    if (data && isDevelopment) {
      console.log("Info data:", data);
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (message, data = null) => {
    if (!isDevelopment && !process.env.DEBUG) return;

    const emoji = getLogEmoji(LOG_LEVELS.DEBUG);
    const logMessage = formatMessage(LOG_LEVELS.DEBUG, message, data);

    console.log(`${emoji} ${logMessage}`);

    if (data) {
      console.log("Debug data:", data);
    }
  },

  /**
   * Log API requests
   */
  apiRequest: (req, additionalData = {}) => {
    const requestData = {
      method: req.method,
      url: req.url,
      userAgent: req.headers["user-agent"],
      ip: req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
      ...additionalData,
    };

    logger.info(`API Request: ${req.method} ${req.url}`, requestData);
  },

  /**
   * Log API responses
   */
  apiResponse: (req, res, responseTime = null, additionalData = {}) => {
    const responseData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : null,
      ...additionalData,
    };

    const level = res.statusCode >= 400 ? "warn" : "info";
    logger[level](
      `API Response: ${req.method} ${req.url} - ${res.statusCode}`,
      responseData
    );
  },

  /**
   * Log database operations
   */
  database: (operation, collection = null, data = null) => {
    const dbData = {
      operation,
      collection,
      timestamp: new Date().toISOString(),
      ...data,
    };

    logger.debug(
      `Database: ${operation}${collection ? ` on ${collection}` : ""}`,
      dbData
    );
  },

  /**
   * Log authentication events
   */
  auth: (event, userId = null, data = null) => {
    const authData = {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...data,
    };

    logger.info(`Auth: ${event}`, authData);
  },

  /**
   * Log payment events
   */
  payment: (event, amount = null, currency = "USD", data = null) => {
    const paymentData = {
      event,
      amount,
      currency,
      timestamp: new Date().toISOString(),
      ...data,
    };

    logger.info(`Payment: ${event}`, paymentData);
  },
};

/**
 * Express middleware for logging requests
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  logger.apiRequest(req);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;
    logger.apiResponse(req, res, responseTime);
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Error handler middleware for Express
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Unhandled error in ${req.method} ${req.url}`, err, {
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Don't expose internal errors in production
  const message = isDevelopment ? err.message : "Internal server error";

  const stack = isDevelopment ? err.stack : undefined;

  res.status(err.status || 500).json({
    error: message,
    ...(stack && { stack }),
  });
};

/**
 * Performance monitoring
 */
export const performanceLogger = {
  /**
   * Time a function execution
   */
  time: async (name, fn) => {
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      logger.debug(`Performance: ${name} completed in ${duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Performance: ${name} failed after ${duration}ms`, error);
      throw error;
    }
  },

  /**
   * Create a timer
   */
  createTimer: (name) => {
    const startTime = Date.now();

    return {
      end: () => {
        const duration = Date.now() - startTime;
        logger.debug(`Timer: ${name} - ${duration}ms`);
        return duration;
      },
    };
  },
};

/**
 * Rate limiting logger
 */
export const rateLimitLogger = {
  /**
   * Log rate limit hits
   */
  hit: (identifier, limit, window) => {
    logger.warn(`Rate limit hit for ${identifier}`, {
      limit,
      window,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log rate limit violations
   */
  violation: (identifier, attempts, limit) => {
    logger.error(`Rate limit violation for ${identifier}`, {
      attempts,
      limit,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export default logger
export default logger;
