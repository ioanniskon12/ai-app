// pages/api/bookings/index.js - Fixed with standardized model imports
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking"; // ✅ Fixed import path
import { logger } from "@/lib/logger";
import {
  validateBookingData,
  validateObjectId,
  validateApiRequest,
} from "@/lib/validation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.apiRequest(req, { requestId });

  try {
    // Validate request method
    const methodValidation = validateApiRequest(req, ["GET", "POST", "DELETE"]);
    if (!methodValidation.valid) {
      logger.warn("Invalid request method", {
        method: req.method,
        requestId,
        errors: methodValidation.errors,
      });

      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).json({
        error: "Method not allowed",
        details: methodValidation.errors,
      });
    }

    // Connect to database with error handling
    try {
      await dbConnect();
      logger.debug("Database connected for bookings API", { requestId });
    } catch (dbError) {
      logger.error("Database connection failed in bookings API", dbError, {
        requestId,
      });
      return res.status(503).json({
        error: "Service temporarily unavailable",
        message: "Unable to connect to database. Please try again later.",
        requestId,
      });
    }

    // Handle GET requests - Fetch bookings
    if (req.method === "GET") {
      try {
        const filter = {};

        // Add email filter if provided
        if (req.query.email) {
          filter.email = req.query.email.toLowerCase();
        }

        // Add user filter if provided
        if (req.query.userId) {
          const userIdValidation = validateObjectId(req.query.userId);
          if (!userIdValidation.valid) {
            return res.status(400).json({
              error: "Invalid user ID format",
              requestId,
            });
          }
          filter.userId = req.query.userId;
        }

        // Add status filter if provided
        if (req.query.status) {
          filter.status = req.query.status;
        }

        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Booking.countDocuments(filter);

        // Fetch bookings with pagination
        const bookings = await Booking.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("userId", "name email image")
          .lean(); // Use lean() for better performance

        logger.info("Bookings fetched successfully", {
          count: bookings.length,
          total,
          page,
          filter,
          requestId,
        });

        return res.status(200).json({
          bookings,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
          requestId,
        });
      } catch (error) {
        logger.error("Error fetching bookings", error, {
          query: req.query,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to fetch bookings",
          message: "An error occurred while retrieving your bookings",
          requestId,
        });
      }
    }

    // Handle POST requests - Create booking
    if (req.method === "POST") {
      try {
        // Get user session for authentication
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email) {
          logger.warn("Unauthorized booking attempt", { requestId });
          return res.status(401).json({
            error: "Authentication required",
            message: "Please log in to create a booking",
            requestId,
          });
        }

        const bookingData = req.body;

        // Validate booking data
        const validation = validateBookingData({
          email: bookingData.email || session.user.email,
          trip: bookingData,
        });

        if (!validation.valid) {
          logger.warn("Invalid booking data", {
            errors: validation.errors,
            requestId,
          });

          return res.status(400).json({
            error: "Invalid booking data",
            details: validation.errors,
            requestId,
          });
        }

        // Ensure email matches session
        if (bookingData.email && bookingData.email !== session.user.email) {
          logger.warn("Email mismatch in booking", {
            sessionEmail: session.user.email,
            bookingEmail: bookingData.email,
            requestId,
          });

          return res.status(403).json({
            error: "Email mismatch",
            message: "Booking email must match your account email",
            requestId,
          });
        }

        // Calculate total price from selected activities
        const activitiesTotal = (bookingData.selectedActivities || []).reduce(
          (sum, activity) =>
            sum + (activity.price?.total || activity.price || 0),
          0
        );

        // Parse base price from string format
        const basePrice =
          typeof bookingData.Price === "string"
            ? parseInt(bookingData.Price.replace(/\D/g, ""), 10) || 0
            : bookingData.Price || 0;

        const totalPrice = basePrice + activitiesTotal;

        // Create booking object with enhanced data structure
        const booking = new Booking({
          userId: session.user.id,
          email: session.user.email,
          destination: bookingData.Destination,
          month: bookingData.Month,
          reason: bookingData.Reason,
          duration: bookingData.Duration,
          startDate: bookingData.StartDate
            ? new Date(bookingData.StartDate)
            : null,
          endDate: bookingData.EndDate ? new Date(bookingData.EndDate) : null,

          // Flight information
          flight: {
            outbound: bookingData.Flight?.Outbound
              ? {
                  departure: {
                    city: bookingData.Flight.Outbound.split(" to ")[0],
                    time: bookingData.Flight.Outbound.includes("at")
                      ? bookingData.Flight.Outbound.split(" at ")[1]
                      : null,
                  },
                  arrival: {
                    city: bookingData.Flight.Outbound.split(" to ")[1]?.split(
                      " at "
                    )[0],
                  },
                }
              : null,
            return: bookingData.Flight?.Return
              ? {
                  departure: {
                    city: bookingData.Flight.Return.split(" to ")[0],
                    time: bookingData.Flight.Return.includes("at")
                      ? bookingData.Flight.Return.split(" at ")[1]
                      : null,
                  },
                  arrival: {
                    city: bookingData.Flight.Return.split(" to ")[1]?.split(
                      " at "
                    )[0],
                  },
                }
              : null,
          },

          // Hotel information
          hotel: {
            name: bookingData.Hotel?.name || "Hotel Name",
            rating: bookingData.Hotel?.rating || 4,
            address: {
              city: bookingData.destination || bookingData.Destination,
              country: bookingData.destination || bookingData.Destination,
            },
            checkIn: bookingData.StartDate
              ? new Date(bookingData.StartDate)
              : new Date(),
            checkOut: bookingData.EndDate
              ? new Date(bookingData.EndDate)
              : new Date(),
            guests: {
              adults: bookingData.guests?.adults || 1,
              children: bookingData.guests?.children || 0,
              rooms: bookingData.guests?.rooms || 1,
            },
            amenities: bookingData.Hotel?.amenities || [],
            familyFriendly: bookingData.hasChildren || false,
            price: {
              perNight: bookingData.Hotel?.pricePerNight || 0,
              total: bookingData.Hotel?.totalPrice || 0,
              currency: "USD",
            },
            description: bookingData.Hotel?.description || "",
            images: bookingData.Hotel?.images || [],
          },

          // Activities
          activities: (bookingData.Activities || []).map((activity) => ({
            name: activity.name || activity,
            description: activity.description || "",
            category: activity.category || "sightseeing",
            duration: activity.duration || "2-3 hours",
            price: {
              total: activity.price || 0,
              currency: "USD",
            },
            childFriendly: activity.childFriendly || false,
            difficultyLevel: activity.difficulty || "easy",
          })),

          selectedActivities: (bookingData.selectedActivities || []).map(
            (activity) => ({
              name: activity.name || activity,
              description: activity.description || "",
              category: activity.category || "sightseeing",
              duration: activity.duration || "2-3 hours",
              price: {
                total: activity.price?.total || activity.price || 0,
                currency: "USD",
              },
              childFriendly: activity.childFriendly || false,
              difficultyLevel: activity.difficulty || "easy",
            })
          ),

          // Weather information
          weather: (bookingData.Weather || []).map((w) => ({
            date: new Date(w.date || Date.now()),
            condition: w.condition || "Sunny",
            temperature: {
              high: w.high || 25,
              low: w.low || 15,
              unit: "celsius",
            },
            icon: w.icon || "sunny",
            description: w.description || "",
          })),

          clothingAdvice: bookingData.ClothingAdvice || [],

          // Family-friendly features
          hasChildren: bookingData.hasChildren || false,
          childFriendlyFeatures: bookingData.ChildFriendlyFeatures || [],
          childrenAges: bookingData.childrenAges || [],

          // Pricing
          price: bookingData.Price,
          totalPrice: totalPrice,
          priceBreakdown: {
            basePrice: basePrice,
            activities: activitiesTotal,
            currency: "USD",
          },

          // Status
          status: "pending",
          paymentStatus: "pending",
          source: "web",
          ipAddress:
            req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
          userAgent: req.headers["user-agent"],
        });

        logger.debug("Creating booking", {
          userId: session.user.id,
          email: session.user.email,
          destination: bookingData.Destination,
          totalPrice: totalPrice,
          requestId,
        });

        await booking.save();

        logger.info("Booking created successfully", {
          bookingId: booking._id.toString(),
          userId: session.user.id,
          destination: bookingData.Destination,
          requestId,
        });

        return res.status(201).json({
          success: true,
          booking: booking.toObject(),
          message: "Booking created successfully",
          requestId,
        });
      } catch (error) {
        logger.error("Error creating booking", error, {
          body: req.body,
          userId: req.body?.userId,
          requestId,
        });

        // Handle specific MongoDB errors
        if (error.name === "ValidationError") {
          const validationErrors = Object.values(error.errors).map(
            (err) => err.message
          );
          return res.status(400).json({
            error: "Validation failed",
            details: validationErrors,
            requestId,
          });
        }

        if (error.code === 11000) {
          return res.status(409).json({
            error: "Duplicate booking",
            message: "A booking with these details already exists",
            requestId,
          });
        }

        return res.status(500).json({
          error: "Failed to create booking",
          message: "An error occurred while creating your booking",
          requestId,
        });
      }
    }

    // Handle DELETE requests - Delete booking
    if (req.method === "DELETE") {
      try {
        const { id } = req.query;

        // Validate booking ID
        const idValidation = validateObjectId(id);
        if (!idValidation.valid) {
          return res.status(400).json({
            error: "Invalid booking ID",
            requestId,
          });
        }

        // Get user session for authentication
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user) {
          return res.status(401).json({
            error: "Authentication required",
            requestId,
          });
        }

        // Find the booking
        const booking = await Booking.findById(id);
        if (!booking) {
          logger.warn("Booking not found for deletion", { id, requestId });
          return res.status(404).json({
            error: "Booking not found",
            requestId,
          });
        }

        // Check permissions
        const isOwner =
          booking.email === session.user.email ||
          booking.userId?.toString() === session.user.id;
        const isAdmin = session.user.role === "admin";

        if (!isOwner && !isAdmin) {
          logger.warn("Unauthorized booking deletion attempt", {
            bookingId: id,
            userId: session.user.id,
            bookingEmail: booking.email,
            userEmail: session.user.email,
            requestId,
          });

          return res.status(403).json({
            error: "Access denied",
            message: "You can only delete your own bookings",
            requestId,
          });
        }

        await Booking.findByIdAndDelete(id);

        logger.info("Booking deleted successfully", {
          bookingId: id,
          userId: session.user.id,
          requestId,
        });

        return res.status(200).json({
          success: true,
          message: "Booking deleted successfully",
          requestId,
        });
      } catch (error) {
        logger.error("Error deleting booking", error, {
          bookingId: req.query.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to delete booking",
          message: "An error occurred while deleting the booking",
          requestId,
        });
      }
    }
  } catch (error) {
    logger.error("Unexpected error in bookings API", error, { requestId });

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      requestId,
    });
  }
}
