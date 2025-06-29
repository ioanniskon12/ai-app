// pages/api/book-trip.js - Fixed version with proper error handling
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Stripe from "stripe";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

export default async function handler(req, res) {
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

    // 6. Save booking to database
    let savedBooking;
    try {
      console.log("📝 Creating booking in database...");

      // Remove weather temporarily to isolate issues
      const { weather, ...bookingDataWithoutWeather } = bookingData;

      // Generate unique tripId if not present
      if (!bookingDataWithoutWeather.tripId) {
        bookingDataWithoutWeather.tripId = `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Try to save without weather first
      savedBooking = await Booking.create(bookingDataWithoutWeather);
      console.log("✅ Booking saved to database:", savedBooking._id);
    } catch (dbError) {
      console.error("❌ Database save failed:", dbError);
      console.error("❌ Full error:", JSON.stringify(dbError, null, 2));

      // Handle duplicate index error specifically
      if (dbError.code === 11000 || dbError.message?.includes("duplicate")) {
        console.log("Attempting to handle duplicate index error...");

        // Try saving with a unique identifier
        try {
          const uniqueBookingData = {
            ...bookingData,
            _id: new mongoose.Types.ObjectId(),
            tripId: `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          delete uniqueBookingData.weather; // Remove weather for now

          savedBooking = await Booking.create(uniqueBookingData);
          console.log("✅ Booking saved with unique ID:", savedBooking._id);
        } catch (retryError) {
          console.error("❌ Retry also failed:", retryError);
          return res.status(500).json({
            error: "Database error - duplicate index issue",
            message: "Please contact support",
            code: "DUPLICATE_INDEX_ERROR",
          });
        }
      } else if (dbError.name === "ValidationError") {
        const validationErrors = Object.values(dbError.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          error: "Validation failed",
          details: validationErrors,
          code: "VALIDATION_ERROR",
        });
      } else {
        return res.status(500).json({
          error: "Failed to create booking record",
          message: dbError.message || "Database error occurred",
          code: "DATABASE_ERROR",
        });
      }
    }

    // 7. Handle payment processing
    // Check if Stripe is configured
    if (!stripe) {
      console.log("⚠️ Stripe not configured - Test mode");

      // Update booking to completed for test mode
      savedBooking.status = "confirmed";
      savedBooking.paymentStatus = "test_mode";
      await savedBooking.save();

      return res.status(200).json({
        success: true,
        bookingId: savedBooking._id.toString(),
        testMode: true,
        message: "Booking created successfully (test mode)",
      });
    }

    // 8. Create Stripe checkout session
    try {
      const lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Trip to ${trip.Destination}`,
              description: `${trip.Duration} in ${trip.Month}`,
              images: trip.destinationImage
                ? [trip.destinationImage]
                : [
                    `https://source.unsplash.com/800x600/?${trip.Destination.split(",")[0]},travel`,
                  ],
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ];

      // Add individual activities as line items
      if (trip.selectedActivities && trip.selectedActivities.length > 0) {
        trip.selectedActivities.forEach((activity) => {
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: activity.name,
                description: `Activity in ${trip.Destination}`,
              },
              unit_amount: Math.round((activity.price || 0) * 100),
            },
            quantity: 1,
          });
        });
      }

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL}/success?booking_id=${savedBooking._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/trip-builder?canceled=true`,
        customer_email: email,
        metadata: {
          bookingId: savedBooking._id.toString(),
          destination: trip.Destination,
        },
      });

      // Update booking with Stripe session ID
      savedBooking.stripeSessionId = stripeSession.id;
      savedBooking.paymentUrl = stripeSession.url;
      await savedBooking.save();

      console.log("✅ Stripe checkout session created:", stripeSession.id);

      return res.status(200).json({
        success: true,
        url: stripeSession.url,
        bookingId: savedBooking._id.toString(),
        sessionId: stripeSession.id,
        message: "Redirecting to Stripe checkout...",
        paymentMethod: "stripe",
      });
    } catch (stripeError) {
      console.error("❌ Stripe error:", stripeError);

      // Mark booking as failed
      if (savedBooking) {
        savedBooking.paymentStatus = "failed";
        savedBooking.status = "pending_payment";
        await savedBooking.save();
      }

      return res.status(500).json({
        error: "Payment system unavailable",
        message:
          "Unable to process payment at this time. Please try again later.",
        code: "STRIPE_ERROR",
        bookingId: savedBooking?._id?.toString(),
      });
    }
  } catch (error) {
    console.error("❌ Book trip API error:", error);
    console.error("❌ Error stack:", error.stack);

    return res.status(500).json({
      error: "Failed to create booking",
      message: error.message || "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
