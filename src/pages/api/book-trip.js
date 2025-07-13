// pages/api/book-trip.js - Complete file with rate limiting
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Stripe from "stripe";
import { withRateLimit } from "../../lib/middleware/rateLimiter";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

async function bookTripHandler(req, res) {
  console.log("🔥 book-trip API called");

  // TEMPORARY FIX: Drop indexes on first run
  try {
    if (mongoose.connection.readyState === 1) {
      const collection = mongoose.connection.db.collection("bookings");
      await collection.dropIndexes();
      console.log("✅ Dropped all indexes to fix duplicate issue");
    }
  } catch (err) {
    console.log("Index drop attempted:", err.message);
  }

  // Set proper headers
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
    });
  }

  try {
    // 1. Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({
        error: "Please log in to book a trip",
        code: "UNAUTHORIZED",
      });
    }

    console.log("✅ User authenticated:", session.user.email);

    // 2. Connect to database
    try {
      await dbConnect();
      console.log("✅ Database connected");

      // Try to fix index issues
      try {
        const collection = mongoose.connection.collection("bookings");
        const indexes = await collection.indexes();
        console.log(
          "Current indexes:",
          indexes.map((idx) => idx.name)
        );

        // Drop duplicate indexes if they exist
        const emailIndexes = indexes.filter(
          (idx) => idx.key && idx.key.email === 1
        );
        if (emailIndexes.length > 1) {
          console.log("Found duplicate email indexes, dropping extras...");
          for (let i = 1; i < emailIndexes.length; i++) {
            await collection.dropIndex(emailIndexes[i].name);
          }
        }
      } catch (indexError) {
        console.warn("Could not check/fix indexes:", indexError.message);
      }
    } catch (dbConnectError) {
      console.error("Database connection failed:", dbConnectError);
      return res.status(500).json({
        error: "Database connection failed",
        code: "DB_CONNECTION_ERROR",
      });
    }

    // 3. Extract and validate data
    const { trip, email } = req.body;

    if (!trip || !email || !trip.Destination) {
      return res.status(400).json({
        error: "Missing required booking data",
        code: "MISSING_DATA",
        details: {
          hasTrip: !!trip,
          hasEmail: !!email,
          hasDestination: !!trip?.Destination,
        },
      });
    }

    // 4. Calculate pricing
    const basePrice =
      trip.basePrice ||
      parseInt(trip.Price?.replace(/[^0-9]/g, "") || "1000", 10);

    const activitiesTotal = (trip.selectedActivities || []).reduce(
      (sum, activity) => sum + (activity.price || 0),
      0
    );

    const totalPrice = basePrice + activitiesTotal;

    console.log("💰 Price calculation:");
    console.log("  Base price:", basePrice);
    console.log("  Activities total:", activitiesTotal);
    console.log("  Total price:", totalPrice);

    // 5. Create booking data for database
    const bookingData = {
      userId: session.user.id || session.user.email,
      email: email,
      destination: trip.Destination,
      month: trip.Month || "TBD",
      reason: trip.Reason || "Travel",
      duration: trip.Duration || "1 week",
      startDate: trip.StartDate ? new Date(trip.StartDate) : undefined,
      endDate: trip.EndDate ? new Date(trip.EndDate) : undefined,
      flight: trip.Flight || {},
      hotel: trip.Hotel || null, // Allow any format - string or object
      activities: trip.Activities || [],
      selectedActivities: trip.selectedActivities || [],
      price: `${totalPrice}`,
      basePrice: basePrice,
      totalPrice: totalPrice,
      passengers: trip.passengers || { adults: 2, children: 0, infants: 0 },
      paymentMethod: "stripe",
      status: "pending_payment",
      paymentStatus: "pending",
      destinationImage: trip.destinationImage || "",
      originalSearchQuery: trip.originalSearchQuery || "",
      weather: trip.Weather || trip.weather || {},
      familyFeatures: {
        isFamily: trip.passengers?.children > 0 || trip.passengers?.infants > 0,
        childFriendlyActivities:
          trip.selectedActivities
            ?.filter((a) => a.childFriendly)
            ?.map((a) => a.name) || [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 6. Generate unique booking reference
    const bookingRef = `AI-TRIP-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
    bookingData.bookingReference = bookingRef;

    console.log("📝 Creating booking with data:", {
      ...bookingData,
      hotel:
        typeof bookingData.hotel === "string" ? bookingData.hotel : "object",
    });

    // 7. Create booking in database
    let savedBooking;
    try {
      const booking = new Booking(bookingData);
      savedBooking = await booking.save();
      console.log("✅ Booking saved to database:", savedBooking._id);
    } catch (dbError) {
      console.error("❌ Database save error:", dbError);

      // Handle specific database errors
      if (dbError.code === 11000) {
        return res.status(409).json({
          error: "Duplicate booking detected",
          message: "A booking with these details already exists",
          code: "DUPLICATE_BOOKING",
        });
      }

      if (dbError.name === "ValidationError") {
        return res.status(400).json({
          error: "Invalid booking data",
          message: dbError.message,
          code: "VALIDATION_ERROR",
          details: Object.keys(dbError.errors),
        });
      }

      return res.status(500).json({
        error: "Failed to save booking",
        message: "Could not save booking to database",
        code: "DATABASE_SAVE_ERROR",
      });
    }

    // 8. Create Stripe payment intent (if Stripe is configured)
    let paymentIntent = null;
    if (stripe) {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalPrice * 100), // Convert to cents
          currency: "usd",
          metadata: {
            bookingId: savedBooking._id.toString(),
            bookingReference: bookingRef,
            userEmail: email,
            destination: trip.Destination,
          },
          description: `AI Traveller booking for ${trip.Destination}`,
        });

        // Update booking with payment intent ID
        await Booking.findByIdAndUpdate(savedBooking._id, {
          stripePaymentIntentId: paymentIntent.id,
        });

        console.log("✅ Stripe payment intent created:", paymentIntent.id);
      } catch (stripeError) {
        console.error("❌ Stripe error:", stripeError);
        // Don't fail the booking for Stripe errors, but log them
      }
    } else {
      console.warn("⚠️ Stripe not configured - payment intent not created");
    }

    // 9. Return success response
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: {
        id: savedBooking._id.toString(),
        bookingReference: bookingRef,
        destination: trip.Destination,
        totalPrice: totalPrice,
        status: "pending_payment",
        email: email,
        createdAt: savedBooking.createdAt,
      },
      payment: paymentIntent
        ? {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          }
        : null,
      code: "BOOKING_SUCCESS",
    });
  } catch (error) {
    console.error("❌ Book trip API error:", error);
    console.error("❌ Error stack:", error.stack);

    // Handle specific error types
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid data format",
        message: "One or more fields contain invalid data",
        code: "CAST_ERROR",
      });
    }

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Service unavailable",
        message:
          "External service temporarily unavailable. Please try again later.",
        code: "SERVICE_UNAVAILABLE",
      });
    }

    if (error.type === "StripeCardError") {
      return res.status(400).json({
        error: "Payment failed",
        message:
          error.message ||
          "Payment could not be processed. Please try again later.",
        code: "STRIPE_ERROR",
        bookingId: savedBooking?._id?.toString(),
      });
    }

    return res.status(500).json({
      error: "Failed to create booking",
      message: error.message || "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    });
  }
}

// Export with rate limiting - 30 requests per hour for booking
export default withRateLimit(bookTripHandler, {
  requests: 30,
  window: 3600000, // 1 hour
  blockDuration: 600000, // 10 minutes
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
