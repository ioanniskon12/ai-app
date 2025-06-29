// pages/api/auth/signup.js - Fixed user registration with standardized imports
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User"; // ✅ Fixed import path - standardized to @/models/
import { logger } from "@/lib/logger";
import { validateUserRegistration, validateApiRequest } from "@/lib/validation";
import { rateLimiter } from "@/lib/rateLimiter";

export default async function handler(req, res) {
  const requestId = `signup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.apiRequest(req, { requestId, endpoint: "signup" });

  try {
    // Validate request method
    const methodValidation = validateApiRequest(req, ["POST"]);
    if (!methodValidation.valid) {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({
        error: "Method not allowed",
        details: methodValidation.errors,
      });
    }

    // Rate limiting by IP address
    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      "unknown";
    const rateLimitPassed = rateLimiter(clientIp, 5, 900000); // 5 attempts per 15 minutes

    if (!rateLimitPassed) {
      logger.warn("Signup rate limit exceeded", { ip: clientIp, requestId });
      return res.status(429).json({
        error: "Too many signup attempts",
        message: "Please wait 15 minutes before trying again",
        requestId,
      });
    }

    const { email, password, name, confirmPassword } = req.body;

    // Validate input data
    const validation = validateUserRegistration({
      email,
      password,
      name,
      confirmPassword,
    });

    if (!validation.valid) {
      logger.warn("Invalid signup data", {
        errors: validation.errors,
        email: email || "not provided",
        requestId,
      });

      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
        requestId,
      });
    }

    // Connect to database
    try {
      await dbConnect();
      logger.debug("Database connected for signup", { requestId });
    } catch (dbError) {
      logger.error("Database connection failed during signup", dbError, {
        requestId,
      });
      return res.status(503).json({
        error: "Service temporarily unavailable",
        message: "Unable to connect to database. Please try again later.",
        requestId,
      });
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      }).lean();

      if (existingUser) {
        logger.warn("Signup attempt with existing email", {
          email: email.toLowerCase(),
          existingUserId: existingUser._id,
          requestId,
        });

        return res.status(409).json({
          error: "Account already exists",
          message:
            "An account with this email address already exists. Please log in instead.",
          requestId,
        });
      }

      // Hash password with proper salt rounds
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate avatar URL
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=667eea&color=fff&size=200`;

      // Create user object with comprehensive data structure
      const userData = {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: "user",
        emailVerified: process.env.SKIP_EMAIL_VERIFICATION === "true" || false,
        image: avatarUrl,

        // Set up profile data
        profile: {
          firstName: name.trim().split(" ")[0] || "",
          lastName: name.trim().split(" ").slice(1).join(" ") || "",
          displayName: name.trim(),
          bio: "",
          location: "",
          phone: "",
          dateOfBirth: null,
        },

        // Set up preferences with defaults
        preferences: {
          notifications: true,
          newsletter: true,
          marketing: false,
          theme: "light",
          language: "en",
          currency: "USD",
          timezone: "UTC",
        },

        // Set up travel preferences
        travelPreferences: {
          preferredDestinations: [],
          budgetRange: {
            min: 0,
            max: 5000,
            currency: "USD",
          },
          travelStyle: "mid-range",
          accommodationType: ["hotel"],
          transportMode: ["flight"],
          groupSize: "solo",
          hasChildren: false,
          childrenAges: [],
          accessibility: {
            wheelchairAccess: false,
            mobilityAid: false,
            visualImpairment: false,
            hearingImpairment: false,
            dietaryRestrictions: [],
            specialRequests: "",
          },
        },

        // Initialize subscription
        subscription: {
          plan: "free",
          status: "active",
          startDate: new Date(),
          endDate: null,
        },

        // Initialize stats
        stats: {
          totalBookings: 0,
          totalSpent: 0,
          countriesVisited: [],
          favoriteDestinations: [],
          averageRating: null,
          totalReviews: 0,
        },

        // Set up privacy settings
        privacy: {
          profileVisible: true,
          showEmail: false,
          showPhone: false,
          showLocation: true,
          allowMessages: true,
          allowReviews: true,
        },

        // Set up metadata
        metadata: {
          source: "web",
          referrer: req.headers.referer || null,
          ipAddress: clientIp,
          userAgent: req.headers["user-agent"] || null,
          firstVisit: new Date(),
        },

        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      // Create user
      const user = await User.create(userData);

      logger.auth("User registered successfully", user._id.toString(), {
        email: user.email,
        name: user.name,
        method: "email_password",
        requestId,
      });

      // Remove password and sensitive fields from response
      const userResponse = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profile: {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          displayName: user.profile.displayName,
        },
        preferences: user.preferences,
      };

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: userResponse,
        requestId,
      });
    } catch (error) {
      // Handle specific MongoDB errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        logger.warn("User validation failed", {
          errors: validationErrors,
          email: email?.toLowerCase(),
          requestId,
        });

        return res.status(400).json({
          error: "User validation failed",
          details: validationErrors,
          requestId,
        });
      }

      if (error.code === 11000) {
        // Duplicate key error (shouldn't happen due to our check, but just in case)
        const field = Object.keys(error.keyPattern)[0];

        logger.warn("Duplicate key error during signup", {
          field,
          email: email?.toLowerCase(),
          requestId,
        });

        return res.status(409).json({
          error: "Account already exists",
          message: `An account with this ${field} already exists`,
          requestId,
        });
      }

      // Log unexpected errors
      logger.error("Unexpected error during user creation", error, {
        email: email?.toLowerCase(),
        requestId,
      });

      return res.status(500).json({
        error: "Failed to create account",
        message: "An unexpected error occurred. Please try again later.",
        requestId,
      });
    }
  } catch (error) {
    logger.error("Unexpected error in signup API", error, { requestId });

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      requestId,
    });
  }
}

// Export config for larger request bodies if needed
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
