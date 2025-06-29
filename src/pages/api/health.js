// pages/api/health.js - Comprehensive health check endpoint
import { checkDbConnection } from "@/lib/mongodb";
import { logger } from "@/lib/logger";

export default async function handler(req, res) {
  const startTime = Date.now();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    services: {},
    performance: {},
    checks: [],
  };

  try {
    // Test database connection
    const dbStart = Date.now();
    try {
      const dbStatus = await checkDbConnection();
      health.services.database = {
        status: dbStatus.status,
        responseTime: Date.now() - dbStart,
        details: {
          readyState: dbStatus.readyState,
          host: dbStatus.host,
          name: dbStatus.name,
        },
      };
      health.checks.push({
        name: "database",
        status: "pass",
        responseTime: Date.now() - dbStart,
      });
    } catch (error) {
      health.services.database = {
        status: "disconnected",
        responseTime: Date.now() - dbStart,
        error: error.message,
      };
      health.checks.push({
        name: "database",
        status: "fail",
        responseTime: Date.now() - dbStart,
        error: error.message,
      });
      health.status = "degraded";
    }

    // Test environment variables
    const envStart = Date.now();
    const requiredEnvVars = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    health.services.environment = {
      status: missingEnvVars.length === 0 ? "ok" : "warning",
      responseTime: Date.now() - envStart,
      required: requiredEnvVars.length,
      missing: missingEnvVars.length,
      missingVars: missingEnvVars,
      optional: {
        googleOAuth: !!(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ),
        facebookOAuth: !!(
          process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
        ),
        stripe: !!(
          process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY
        ),
        smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        unsplash: !!process.env.UNSPLASH_ACCESS_KEY,
      },
    };

    health.checks.push({
      name: "environment",
      status: missingEnvVars.length === 0 ? "pass" : "warn",
      responseTime: Date.now() - envStart,
      details: { missing: missingEnvVars },
    });

    if (missingEnvVars.length > 0 && health.status === "ok") {
      health.status = "warning";
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();
    health.performance.memory = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      arrayBuffers: `${Math.round(memoryUsage.arrayBuffers / 1024 / 1024)}MB`,
    };

    // CPU usage (basic estimation)
    const cpuUsage = process.cpuUsage();
    health.performance.cpu = {
      user: cpuUsage.user,
      system: cpuUsage.system,
    };

    // Event loop lag (approximate)
    const eventLoopStart = Date.now();
    setImmediate(() => {
      health.performance.eventLoopLag = `${Date.now() - eventLoopStart}ms`;
    });

    // Total response time
    health.performance.totalResponseTime = Date.now() - startTime;

    // Overall health status
    const failedChecks = health.checks.filter(
      (check) => check.status === "fail"
    ).length;
    const warnChecks = health.checks.filter(
      (check) => check.status === "warn"
    ).length;

    if (failedChecks > 0) {
      health.status = "error";
    } else if (warnChecks > 0 && health.status === "ok") {
      health.status = "warning";
    }

    // Set appropriate HTTP status code
    let statusCode = 200;
    if (health.status === "error") {
      statusCode = 503; // Service Unavailable
    } else if (health.status === "degraded") {
      statusCode = 206; // Partial Content
    } else if (health.status === "warning") {
      statusCode = 200; // OK but with warnings
    }

    // Log health check
    if (health.status === "error" || health.status === "degraded") {
      logger.error("Health check failed", null, {
        status: health.status,
        failedChecks: health.checks.filter((c) => c.status === "fail"),
        responseTime: health.performance.totalResponseTime,
      });
    } else {
      logger.debug("Health check completed", {
        status: health.status,
        responseTime: health.performance.totalResponseTime,
      });
    }

    // Add cache headers for health endpoint
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error("Health check error", error);

    health.status = "error";
    health.error = error.message;
    health.performance.totalResponseTime = Date.now() - startTime;

    res.status(503).json(health);
  }
}

// Detailed health check for admin use
export async function getDetailedHealth() {
  const health = await handler(
    { method: "GET" },
    {
      setHeader: () => {},
      status: (code) => ({ json: (data) => data }),
    }
  );

  return health;
}
