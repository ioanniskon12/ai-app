// pages/api/user/analytics.js - User personal analytics and insights
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { logger } from "@/lib/logger";
import { validateApiRequest } from "@/lib/validation";

export default async function handler(req, res) {
  const requestId = `user-analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.apiRequest(req, { requestId, endpoint: "user/analytics" });

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      logger.warn("Unauthorized user analytics access attempt", { requestId });
      return res.status(401).json({
        error: "Authentication required",
        requestId,
      });
    }

    // Validate request method
    const methodValidation = validateApiRequest(req, ["GET"]);
    if (!methodValidation.valid) {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        error: "Method not allowed",
        details: methodValidation.errors,
        requestId,
      });
    }

    // Connect to database
    try {
      await dbConnect();
      logger.debug("Database connected for user analytics API", { requestId });
    } catch (dbError) {
      logger.error(
        "Database connection failed in user analytics API",
        dbError,
        { requestId }
      );
      return res.status(503).json({
        error: "Service temporarily unavailable",
        message: "Unable to connect to database. Please try again later.",
        requestId,
      });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    try {
      // Get user's booking data
      const userBookings = await Booking.find({
        $or: [{ userId: userId }, { email: userEmail }],
      }).sort({ createdAt: -1 });

      // Basic user stats
      const totalBookings = userBookings.length;
      const confirmedBookings = userBookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const completedBookings = userBookings.filter(
        (b) => b.status === "completed"
      ).length;
      const cancelledBookings = userBookings.filter(
        (b) => b.status === "cancelled"
      ).length;
      const totalSpent = userBookings
        .filter((b) => ["confirmed", "completed"].includes(b.status))
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      // Countries/destinations visited
      const destinationsVisited = [
        ...new Set(
          userBookings
            .filter((b) => ["confirmed", "completed"].includes(b.status))
            .map((b) => b.destination)
        ),
      ];

      // Favorite destinations (most booked)
      const destinationCounts = {};
      userBookings.forEach((booking) => {
        if (["confirmed", "completed"].includes(booking.status)) {
          destinationCounts[booking.destination] =
            (destinationCounts[booking.destination] || 0) + 1;
        }
      });

      const favoriteDestinations = Object.entries(destinationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([destination, count]) => ({ destination, count }));

      // Spending analysis
      const spendingByMonth = {};
      const spendingByDestination = {};

      userBookings
        .filter((b) => ["confirmed", "completed"].includes(b.status))
        .forEach((booking) => {
          // Monthly spending
          const monthKey = `${booking.createdAt.getFullYear()}-${String(booking.createdAt.getMonth() + 1).padStart(2, "0")}`;
          spendingByMonth[monthKey] =
            (spendingByMonth[monthKey] || 0) + (booking.totalPrice || 0);

          // Spending by destination
          spendingByDestination[booking.destination] =
            (spendingByDestination[booking.destination] || 0) +
            (booking.totalPrice || 0);
        });

      // Travel patterns
      const travelPatterns = {
        averageTripsPerYear: 0,
        averageSpendPerTrip: 0,
        averageTripDuration: 0,
        mostPopularMonth: null,
        travelFrequency: "occasional", // occasional, regular, frequent
      };

      if (totalBookings > 0) {
        // Calculate average trips per year
        const firstBooking = userBookings[userBookings.length - 1];
        const yearsSinceFirstBooking =
          (new Date() - firstBooking.createdAt) / (1000 * 60 * 60 * 24 * 365);
        travelPatterns.averageTripsPerYear =
          yearsSinceFirstBooking > 0
            ? (totalBookings / yearsSinceFirstBooking).toFixed(1)
            : totalBookings;

        // Average spend per trip
        const completedTrips = userBookings.filter((b) =>
          ["confirmed", "completed"].includes(b.status)
        );
        if (completedTrips.length > 0) {
          travelPatterns.averageSpendPerTrip =
            totalSpent / completedTrips.length;
        }

        // Average trip duration
        const tripsWithDuration = userBookings.filter(
          (b) => b.startDate && b.endDate
        );
        if (tripsWithDuration.length > 0) {
          const totalDuration = tripsWithDuration.reduce((sum, b) => {
            const duration =
              (new Date(b.endDate) - new Date(b.startDate)) /
              (1000 * 60 * 60 * 24);
            return sum + duration;
          }, 0);
          travelPatterns.averageTripDuration = Math.round(
            totalDuration / tripsWithDuration.length
          );
        }

        // Most popular month
        const monthCounts = {};
        userBookings.forEach((booking) => {
          if (booking.startDate) {
            const month = booking.startDate.getMonth();
            monthCounts[month] = (monthCounts[month] || 0) + 1;
          }
        });

        if (Object.keys(monthCounts).length > 0) {
          const mostPopularMonthIndex = Object.entries(monthCounts).sort(
            ([, a], [, b]) => b - a
          )[0][0];
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          travelPatterns.mostPopularMonth =
            monthNames[parseInt(mostPopularMonthIndex)];
        }

        // Travel frequency classification
        if (travelPatterns.averageTripsPerYear >= 6) {
          travelPatterns.travelFrequency = "frequent";
        } else if (travelPatterns.averageTripsPerYear >= 2) {
          travelPatterns.travelFrequency = "regular";
        } else {
          travelPatterns.travelFrequency = "occasional";
        }
      }

      // Upcoming trips
      const upcomingTrips = userBookings
        .filter(
          (b) =>
            b.startDate &&
            new Date(b.startDate) > new Date() &&
            ["confirmed", "pending"].includes(b.status)
        )
        .slice(0, 3);

      // Recent trips
      const recentTrips = userBookings
        .filter(
          (b) =>
            b.endDate &&
            new Date(b.endDate) < new Date() &&
            ["completed", "confirmed"].includes(b.status)
        )
        .slice(0, 3);

      // Edit request history
      const editRequests = [];
      userBookings.forEach((booking) => {
        if (booking.modifications && booking.modifications.length > 0) {
          const userEditRequests = booking.modifications.filter(
            (mod) =>
              mod.field === "edit_request" &&
              mod.modifiedBy?.toString() === userId
          );

          userEditRequests.forEach((req) => {
            editRequests.push({
              id: req._id,
              bookingId: booking._id,
              destination: booking.destination,
              requestType: req.requestType,
              status: req.status,
              submittedAt: req.modifiedAt,
              resolvedAt: req.resolvedAt,
            });
          });
        }
      });

      // Sort edit requests by submission date
      editRequests.sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );

      // Travel goals and achievements
      const achievements = [];

      if (destinationsVisited.length >= 5) {
        achievements.push({
          id: "explorer",
          title: "World Explorer",
          description: `Visited ${destinationsVisited.length} destinations`,
          icon: "🌍",
          unlockedAt: new Date(),
        });
      }

      if (totalSpent >= 10000) {
        achievements.push({
          id: "big_spender",
          title: "Travel Enthusiast",
          description: `Spent over $${(totalSpent / 1000).toFixed(0)}K on travel`,
          icon: "💎",
          unlockedAt: new Date(),
        });
      }

      if (completedBookings >= 10) {
        achievements.push({
          id: "frequent_traveler",
          title: "Frequent Traveler",
          description: `Completed ${completedBookings} trips`,
          icon: "✈️",
          unlockedAt: new Date(),
        });
      }

      // Personalized recommendations
      const recommendations = [];

      // Recommend based on favorite destinations
      if (favoriteDestinations.length > 0) {
        recommendations.push({
          type: "destination",
          title: `Return to ${favoriteDestinations[0].destination}`,
          description: `You've visited ${favoriteDestinations[0].destination} ${favoriteDestinations[0].count} times. Plan another trip!`,
          priority: "high",
        });
      }

      // Recommend based on spending patterns
      if (travelPatterns.averageSpendPerTrip > 0) {
        const budgetCategory =
          travelPatterns.averageSpendPerTrip > 3000
            ? "luxury"
            : travelPatterns.averageSpendPerTrip > 1500
              ? "premium"
              : "budget";

        recommendations.push({
          type: "budget",
          title: `${budgetCategory.charAt(0).toUpperCase() + budgetCategory.slice(1)} Travel Deals`,
          description: `Based on your average spend of $${Math.round(travelPatterns.averageSpendPerTrip)}, here are some ${budgetCategory} options`,
          priority: "medium",
        });
      }

      // Recommend based on travel frequency
      if (travelPatterns.travelFrequency === "frequent") {
        recommendations.push({
          type: "membership",
          title: "Premium Membership",
          description:
            "As a frequent traveler, upgrade to premium for exclusive benefits",
          priority: "high",
        });
      }

      // Savings and loyalty insights
      const loyaltyInsights = {
        totalSaved: 0, // You can implement discount tracking
        memberSince: session.user.createdAt || new Date(),
        loyaltyLevel: travelPatterns.travelFrequency,
        nextMilestone: {
          target:
            completedBookings < 5
              ? 5
              : completedBookings < 10
                ? 10
                : completedBookings < 20
                  ? 20
                  : 50,
          current: completedBookings,
          reward: "Special discount on next booking",
        },
      };

      const analyticsData = {
        overview: {
          totalBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          totalSpent,
          destinationsVisited: destinationsVisited.length,
          memberSince: session.user.createdAt || new Date(),
        },

        destinations: {
          visited: destinationsVisited,
          favorites: favoriteDestinations,
          spendingByDestination: Object.entries(spendingByDestination)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([destination, amount]) => ({ destination, amount })),
        },

        spending: {
          total: totalSpent,
          average: travelPatterns.averageSpendPerTrip,
          byMonth: Object.entries(spendingByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, amount]) => ({ month, amount })),
        },

        travelPatterns,

        trips: {
          upcoming: upcomingTrips.map((trip) => ({
            id: trip._id,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            status: trip.status,
          })),
          recent: recentTrips.map((trip) => ({
            id: trip._id,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            status: trip.status,
            totalPrice: trip.totalPrice,
          })),
        },

        editRequests: editRequests.slice(0, 5), // Last 5 edit requests

        achievements,
        recommendations,
        loyaltyInsights,
      };

      logger.info("User analytics generated successfully", {
        userId,
        totalBookings,
        totalSpent,
        destinationsCount: destinationsVisited.length,
        requestId,
      });

      return res.status(200).json({
        analytics: analyticsData,
        metadata: {
          generatedAt: new Date(),
          userId,
          email: userEmail,
        },
        requestId,
      });
    } catch (error) {
      logger.error("Error generating user analytics", error, {
        userId,
        requestId,
      });

      return res.status(500).json({
        error: "Failed to generate analytics",
        message: "An error occurred while generating your travel analytics",
        requestId,
      });
    }
  } catch (error) {
    logger.error("Unexpected error in user analytics API", error, {
      requestId,
    });

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      requestId,
    });
  }
}
