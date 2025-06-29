// pages/api/admin/bookings.js - Fixed admin bookings API with standardized imports
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking"; // ✅ Fixed import path - standardized to @/models/
import { logger } from "@/lib/logger";
import { validateObjectId, validateApiRequest } from "@/lib/validation";

export default async function handler(req, res) {
  const requestId = `admin-bookings-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.apiRequest(req, { requestId, endpoint: "admin/bookings" });

  try {
    // Get user session and check admin permissions
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      logger.warn("Unauthorized admin access attempt", { requestId });
      return res.status(401).json({
        error: "Authentication required",
        requestId,
      });
    }

    if (session.user.role !== "admin") {
      logger.warn("Non-admin user attempted to access admin bookings", {
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
    const methodValidation = validateApiRequest(req, ["GET", "PUT", "DELETE"]);
    if (!methodValidation.valid) {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).json({
        error: "Method not allowed",
        details: methodValidation.errors,
        requestId,
      });
    }

    // Connect to database
    try {
      await dbConnect();
      logger.debug("Database connected for admin bookings API", { requestId });
    } catch (dbError) {
      logger.error(
        "Database connection failed in admin bookings API",
        dbError,
        { requestId }
      );
      return res.status(503).json({
        error: "Service temporarily unavailable",
        message: "Unable to connect to database. Please try again later.",
        requestId,
      });
    }

    // Handle GET requests - Fetch bookings
    if (req.method === "GET") {
      try {
        const {
          page = 1,
          limit = 20,
          search = "",
          status = "",
          destination = "",
          dateRange = "",
          sortBy = "createdAt",
          sortOrder = "desc",
        } = req.query;

        // Build filter query
        const filter = {};

        // Search filter (by destination, email, or booking reference)
        if (search) {
          filter.$or = [
            { destination: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { bookingReference: { $regex: search, $options: "i" } },
            { "hotel.name": { $regex: search, $options: "i" } },
          ];
        }

        // Status filter
        if (status && status !== "all") {
          filter.status = status;
        }

        // Destination filter
        if (destination && destination !== "all") {
          filter.destination = { $regex: destination, $options: "i" };
        }

        // Date range filter
        if (dateRange) {
          const now = new Date();
          let startDate, endDate;

          switch (dateRange) {
            case "today":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
              break;
            case "week":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              endDate = now;
              break;
            case "month":
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              endDate = now;
              break;
            case "year":
              startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
              endDate = now;
              break;
          }

          if (startDate && endDate) {
            filter.createdAt = { $gte: startDate, $lte: endDate };
          }
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 bookings per page
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        const sortOptions = {};
        const validSortFields = [
          "createdAt",
          "startDate",
          "totalPrice",
          "destination",
          "status",
        ];
        const sortField = validSortFields.includes(sortBy)
          ? sortBy
          : "createdAt";
        const sortDirection = sortOrder === "asc" ? 1 : -1;
        sortOptions[sortField] = sortDirection;

        // Get total count
        const totalBookings = await Booking.countDocuments(filter);

        // Fetch bookings with user data
        const bookings = await Booking.find(filter)
          .populate("userId", "name email image role")
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean();

        // Get booking stats
        const stats = await Booking.getBookingStats();

        // Get additional admin stats
        const recentBookings = await Booking.find({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }).countDocuments();

        const upcomingTrips = await Booking.find({
          startDate: { $gte: new Date() },
          status: { $in: ["confirmed", "pending"] },
        }).countDocuments();

        logger.info("Admin bookings fetched successfully", {
          count: bookings.length,
          total: totalBookings,
          page: pageNum,
          adminId: session.user.id,
          requestId,
        });

        return res.status(200).json({
          bookings,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalBookings,
            pages: Math.ceil(totalBookings / limitNum),
            hasNext: pageNum * limitNum < totalBookings,
            hasPrev: pageNum > 1,
          },
          stats: {
            ...stats,
            recentBookings,
            upcomingTrips,
          },
          requestId,
        });
      } catch (error) {
        logger.error("Error fetching bookings in admin panel", error, {
          query: req.query,
          adminId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to fetch bookings",
          message: "An error occurred while retrieving booking data",
          requestId,
        });
      }
    }

    // Handle PUT requests - Update booking
    if (req.method === "PUT") {
      try {
        const { bookingId } = req.query;
        const updateData = req.body;

        // Validate booking ID
        const idValidation = validateObjectId(bookingId);
        if (!idValidation.valid) {
          return res.status(400).json({
            error: "Invalid booking ID format",
            requestId,
          });
        }

        // Find booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          logger.warn("Booking not found for admin update", {
            bookingId,
            requestId,
          });
          return res.status(404).json({
            error: "Booking not found",
            requestId,
          });
        }

        // Allowed fields for admin update
        const allowedUpdates = [
          "status",
          "paymentStatus",
          "specialRequests",
          "internalNotes",
        ];

        // Filter update data to only allowed fields
        const filteredUpdates = {};
        allowedUpdates.forEach((field) => {
          if (updateData[field] !== undefined) {
            filteredUpdates[field] = updateData[field];
          }
        });

        // Add modification record
        if (Object.keys(filteredUpdates).length > 0) {
          const modification = {
            modifiedAt: new Date(),
            modifiedBy: session.user.id,
            field: Object.keys(filteredUpdates).join(", "),
            oldValue: {
              status: booking.status,
              paymentStatus: booking.paymentStatus,
            },
            newValue: filteredUpdates,
            reason: updateData.reason || "Admin update",
          };

          filteredUpdates.$push = { modifications: modification };
          filteredUpdates.updatedAt = new Date();
        }

        // Update booking
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          filteredUpdates,
          { new: true }
        ).populate("userId", "name email image");

        logger.info("Booking updated by admin", {
          bookingId,
          adminId: session.user.id,
          updates: Object.keys(filteredUpdates),
          requestId,
        });

        return res.status(200).json({
          success: true,
          booking: updatedBooking,
          message: "Booking updated successfully",
          requestId,
        });
      } catch (error) {
        logger.error("Error updating booking in admin panel", error, {
          bookingId: req.query.bookingId,
          adminId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to update booking",
          message: "An error occurred while updating the booking",
          requestId,
        });
      }
    }

    // Handle DELETE requests - Delete booking
    if (req.method === "DELETE") {
      try {
        const { bookingId } = req.query;

        // Validate booking ID
        const idValidation = validateObjectId(bookingId);
        if (!idValidation.valid) {
          return res.status(400).json({
            error: "Invalid booking ID format",
            requestId,
          });
        }

        // Find booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          logger.warn("Booking not found for admin deletion", {
            bookingId,
            requestId,
          });
          return res.status(404).json({
            error: "Booking not found",
            requestId,
          });
        }

        // Check if booking can be deleted (safety check)
        if (booking.status === "confirmed" && booking.isUpcoming) {
          return res.status(400).json({
            error: "Cannot delete confirmed upcoming booking",
            message: "Please cancel the booking first or change its status",
            requestId,
          });
        }

        // Store booking info for logging before deletion
        const deletedBookingInfo = {
          bookingId: booking._id,
          email: booking.email,
          destination: booking.destination,
          status: booking.status,
          totalPrice: booking.totalPrice,
        };

        // Delete booking
        await Booking.findByIdAndDelete(bookingId);

        logger.info("Booking deleted by admin", {
          ...deletedBookingInfo,
          adminId: session.user.id,
          requestId,
        });

        return res.status(200).json({
          success: true,
          message: "Booking deleted successfully",
          deletedBooking: deletedBookingInfo,
          requestId,
        });
      } catch (error) {
        logger.error("Error deleting booking in admin panel", error, {
          bookingId: req.query.bookingId,
          adminId: session.user.id,
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
    logger.error("Unexpected error in admin bookings API", error, {
      requestId,
    });

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      requestId,
    });
  }
}
