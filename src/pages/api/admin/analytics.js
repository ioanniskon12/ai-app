// pages/api/admin/analytics.js - Comprehensive analytics API
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { logger } from "@/lib/logger";
import { validateApiRequest } from "@/lib/validation";

export default async function handler(req, res) {
  const requestId = `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.apiRequest(req, { requestId, endpoint: "admin/analytics" });

  try {
    // Get user session and check admin permissions
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      logger.warn("Unauthorized analytics access attempt", { requestId });
      return res.status(401).json({
        error: "Authentication required",
        requestId,
      });
    }

    if (session.user.role !== "admin") {
      logger.warn("Non-admin user attempted to access analytics", {
        userId: session.user.id,
        userRole: session.user.role,
        requestId,
      });
      return res.status(403).json({
        error: "Access denied - Admin privileges required",
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
      logger.debug("Database connected for analytics API", { requestId });
    } catch (dbError) {
      logger.error("Database connection failed in analytics API", dbError, {
        requestId,
      });
      return res.status(503).json({
        error: "Service temporarily unavailable",
        message: "Unable to connect to database. Please try again later.",
        requestId,
      });
    }

    const { timeRange = "30d", metric = "overview" } = req.query;

    // Calculate date range
    const getDateRange = (range) => {
      const now = new Date();
      let startDate;

      switch (range) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      return { startDate, endDate: now };
    };

    const { startDate, endDate } = getDateRange(timeRange);

    try {
      let analyticsData = {};

      // Overview Analytics
      if (metric === "overview" || metric === "all") {
        // Basic metrics
        const [
          totalBookings,
          totalUsers,
          recentBookings,
          recentUsers,
          totalRevenue,
          recentRevenue,
        ] = await Promise.all([
          Booking.countDocuments(),
          User.countDocuments(),
          Booking.countDocuments({ createdAt: { $gte: startDate } }),
          User.countDocuments({ createdAt: { $gte: startDate } }),
          Booking.aggregate([
            { $match: { status: { $in: ["confirmed", "completed"] } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
          ]),
          Booking.aggregate([
            {
              $match: {
                status: { $in: ["confirmed", "completed"] },
                createdAt: { $gte: startDate },
              },
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
          ]),
        ]);

        // Calculate growth rates
        const previousPeriod = new Date(
          startDate.getTime() - (endDate.getTime() - startDate.getTime())
        );
        const [prevBookings, prevUsers, prevRevenue] = await Promise.all([
          Booking.countDocuments({
            createdAt: { $gte: previousPeriod, $lt: startDate },
          }),
          User.countDocuments({
            createdAt: { $gte: previousPeriod, $lt: startDate },
          }),
          Booking.aggregate([
            {
              $match: {
                status: { $in: ["confirmed", "completed"] },
                createdAt: { $gte: previousPeriod, $lt: startDate },
              },
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
          ]),
        ]);

        const calculateGrowth = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return (((current - previous) / previous) * 100).toFixed(1);
        };

        analyticsData.overview = {
          totalBookings,
          totalUsers,
          totalRevenue: totalRevenue[0]?.total || 0,
          recentMetrics: {
            bookings: {
              current: recentBookings,
              previous: prevBookings,
              growth: calculateGrowth(recentBookings, prevBookings),
            },
            users: {
              current: recentUsers,
              previous: prevUsers,
              growth: calculateGrowth(recentUsers, prevUsers),
            },
            revenue: {
              current: recentRevenue[0]?.total || 0,
              previous: prevRevenue[0]?.total || 0,
              growth: calculateGrowth(
                recentRevenue[0]?.total || 0,
                prevRevenue[0]?.total || 0
              ),
            },
          },
        };
      }

      // Booking Analytics
      if (metric === "bookings" || metric === "all") {
        const bookingStats = await Booking.aggregate([
          {
            $facet: {
              // Status distribution
              statusDistribution: [
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
              ],

              // Monthly booking trends (last 12 months)
              monthlyTrends: [
                {
                  $match: {
                    createdAt: {
                      $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      year: { $year: "$createdAt" },
                      month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalPrice" },
                  },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 },
              ],

              // Top destinations
              topDestinations: [
                {
                  $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: ["confirmed", "completed"] },
                  },
                },
                {
                  $group: {
                    _id: "$destination",
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalPrice" },
                  },
                },
                { $sort: { count: -1 } },
                { $limit: 10 },
              ],

              // Average booking value by month
              avgBookingValue: [
                {
                  $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: ["confirmed", "completed"] },
                  },
                },
                {
                  $group: {
                    _id: {
                      year: { $year: "$createdAt" },
                      month: { $month: "$createdAt" },
                    },
                    avgValue: { $avg: "$totalPrice" },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
              ],

              // Booking conversion funnel
              conversionFunnel: [
                {
                  $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                  },
                },
              ],
            },
          },
        ]);

        analyticsData.bookings = bookingStats[0];
      }

      // User Analytics
      if (metric === "users" || metric === "all") {
        const userStats = await User.aggregate([
          {
            $facet: {
              // User registration trends
              registrationTrends: [
                {
                  $match: {
                    createdAt: {
                      $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      year: { $year: "$createdAt" },
                      month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 },
              ],

              // User roles distribution
              roleDistribution: [
                { $group: { _id: "$role", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
              ],

              // Email verification rates
              verificationStats: [
                {
                  $group: {
                    _id: "$emailVerified",
                    count: { $sum: 1 },
                  },
                },
              ],

              // User engagement (based on bookings)
              userEngagement: [
                {
                  $lookup: {
                    from: "bookings",
                    localField: "_id",
                    foreignField: "userId",
                    as: "bookings",
                  },
                },
                {
                  $addFields: {
                    bookingCount: { $size: "$bookings" },
                    totalSpent: { $sum: "$bookings.totalPrice" },
                  },
                },
                {
                  $group: {
                    _id: {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ["$bookingCount", 0] },
                            then: "no_bookings",
                          },
                          {
                            case: { $lte: ["$bookingCount", 2] },
                            then: "low_engagement",
                          },
                          {
                            case: { $lte: ["$bookingCount", 5] },
                            then: "medium_engagement",
                          },
                          {
                            case: { $gt: ["$bookingCount", 5] },
                            then: "high_engagement",
                          },
                        ],
                        default: "unknown",
                      },
                    },
                    count: { $sum: 1 },
                    avgSpent: { $avg: "$totalSpent" },
                  },
                },
              ],
            },
          },
        ]);

        analyticsData.users = userStats[0];
      }

      // Edit Request Analytics
      if (metric === "edit-requests" || metric === "all") {
        const editRequestStats = await Booking.aggregate([
          // Unwind modifications to work with individual edit requests
          { $unwind: "$modifications" },

          // Filter for edit requests only
          { $match: { "modifications.field": "edit_request" } },

          {
            $facet: {
              // Edit request status distribution
              statusDistribution: [
                {
                  $group: {
                    _id: "$modifications.status",
                    count: { $sum: 1 },
                  },
                },
                { $sort: { count: -1 } },
              ],

              // Edit request types
              typeDistribution: [
                {
                  $group: {
                    _id: "$modifications.requestType",
                    count: { $sum: 1 },
                  },
                },
                { $sort: { count: -1 } },
              ],

              // Edit requests over time
              timeSeriesData: [
                {
                  $match: {
                    "modifications.modifiedAt": { $gte: startDate },
                  },
                },
                {
                  $group: {
                    _id: {
                      year: { $year: "$modifications.modifiedAt" },
                      month: { $month: "$modifications.modifiedAt" },
                      day: { $dayOfMonth: "$modifications.modifiedAt" },
                    },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
              ],

              // Resolution times (for completed requests)
              resolutionTimes: [
                {
                  $match: {
                    "modifications.resolved": true,
                    "modifications.resolvedAt": { $exists: true },
                  },
                },
                {
                  $addFields: {
                    resolutionTimeHours: {
                      $divide: [
                        {
                          $subtract: [
                            "$modifications.resolvedAt",
                            "$modifications.modifiedAt",
                          ],
                        },
                        1000 * 60 * 60, // Convert to hours
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    avgResolutionTime: { $avg: "$resolutionTimeHours" },
                    minResolutionTime: { $min: "$resolutionTimeHours" },
                    maxResolutionTime: { $max: "$resolutionTimeHours" },
                    count: { $sum: 1 },
                  },
                },
              ],

              // Cost impact analysis
              costImpact: [
                {
                  $match: {
                    "modifications.estimatedCost": { $exists: true, $gt: 0 },
                  },
                },
                {
                  $group: {
                    _id: "$modifications.requestType",
                    avgCost: { $avg: "$modifications.estimatedCost" },
                    totalCost: { $sum: "$modifications.estimatedCost" },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { totalCost: -1 } },
              ],
            },
          },
        ]);

        analyticsData.editRequests = editRequestStats[0] || {
          statusDistribution: [],
          typeDistribution: [],
          timeSeriesData: [],
          resolutionTimes: [],
          costImpact: [],
        };
      }

      // Revenue Analytics
      if (metric === "revenue" || metric === "all") {
        const revenueStats = await Booking.aggregate([
          {
            $match: {
              status: { $in: ["confirmed", "completed"] },
              totalPrice: { $exists: true, $gt: 0 },
            },
          },
          {
            $facet: {
              // Monthly revenue trends
              monthlyRevenue: [
                {
                  $match: {
                    createdAt: {
                      $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      year: { $year: "$createdAt" },
                      month: { $month: "$createdAt" },
                    },
                    revenue: { $sum: "$totalPrice" },
                    count: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalPrice" },
                  },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 },
              ],

              // Revenue by destination
              revenueByDestination: [
                {
                  $match: {
                    createdAt: { $gte: startDate },
                  },
                },
                {
                  $group: {
                    _id: "$destination",
                    revenue: { $sum: "$totalPrice" },
                    bookings: { $sum: 1 },
                    avgValue: { $avg: "$totalPrice" },
                  },
                },
                { $sort: { revenue: -1 } },
                { $limit: 10 },
              ],

              // Revenue distribution by booking value ranges
              revenueDistribution: [
                {
                  $bucket: {
                    groupBy: "$totalPrice",
                    boundaries: [0, 500, 1000, 2000, 5000, 10000, 999999],
                    default: "other",
                    output: {
                      count: { $sum: 1 },
                      totalRevenue: { $sum: "$totalPrice" },
                      avgValue: { $avg: "$totalPrice" },
                    },
                  },
                },
              ],
            },
          },
        ]);

        analyticsData.revenue = revenueStats[0];
      }

      // Performance Metrics
      if (metric === "performance" || metric === "all") {
        const performanceStats = await Promise.all([
          // Cancellation rate
          Booking.aggregate([
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ]),

          // Average booking processing time
          Booking.aggregate([
            {
              $match: {
                status: "confirmed",
                createdAt: { $gte: startDate },
              },
            },
            {
              $addFields: {
                processingTime: {
                  $subtract: ["$updatedAt", "$createdAt"],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgProcessingTime: { $avg: "$processingTime" },
                count: { $sum: 1 },
              },
            },
          ]),

          // Customer satisfaction (based on reviews if available)
          Booking.aggregate([
            {
              $match: {
                "review.rating": { $exists: true },
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: "$review.rating" },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                  $push: "$review.rating",
                },
              },
            },
          ]),
        ]);

        analyticsData.performance = {
          cancellationRate: performanceStats[0],
          processingTime: performanceStats[1][0] || null,
          customerSatisfaction: performanceStats[2][0] || null,
        };
      }

      logger.info("Analytics data fetched successfully", {
        metric,
        timeRange,
        adminId: session.user.id,
        requestId,
      });

      return res.status(200).json({
        analytics: analyticsData,
        metadata: {
          timeRange,
          startDate,
          endDate,
          generatedAt: new Date(),
          metric,
        },
        requestId,
      });
    } catch (error) {
      logger.error("Error generating analytics", error, {
        metric,
        timeRange,
        adminId: session.user.id,
        requestId,
      });

      return res.status(500).json({
        error: "Failed to generate analytics",
        message: "An error occurred while generating analytics data",
        requestId,
      });
    }
  } catch (error) {
    logger.error("Unexpected error in analytics API", error, { requestId });

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      requestId,
    });
  }
}
