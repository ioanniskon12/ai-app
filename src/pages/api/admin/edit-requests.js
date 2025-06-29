// pages/api/admin/edit-requests.js - Admin edit request management
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { logger } from "@/lib/logger";
import { validateObjectId, validateApiRequest } from "@/lib/validation";

export default async function handler(req, res) {
  const requestId = `admin-edit-requests-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.apiRequest(req, { requestId, endpoint: "admin/edit-requests" });

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
      logger.warn("Non-admin user attempted to access admin edit requests", {
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
    const methodValidation = validateApiRequest(req, ["GET", "PUT"]);
    if (!methodValidation.valid) {
      res.setHeader("Allow", ["GET", "PUT"]);
      return res.status(405).json({
        error: "Method not allowed",
        details: methodValidation.errors,
        requestId,
      });
    }

    // Connect to database
    try {
      await dbConnect();
      logger.debug("Database connected for admin edit requests API", {
        requestId,
      });
    } catch (dbError) {
      logger.error(
        "Database connection failed in admin edit requests API",
        dbError,
        { requestId }
      );
      return res.status(503).json({
        error: "Service temporarily unavailable",
        message: "Unable to connect to database. Please try again later.",
        requestId,
      });
    }

    // Handle GET requests - Fetch all edit requests
    if (req.method === "GET") {
      try {
        const {
          page = 1,
          limit = 20,
          status = "all",
          requestType = "all",
          sortBy = "submittedAt",
          sortOrder = "desc",
        } = req.query;

        // Build aggregation pipeline to get all edit requests
        const pipeline = [
          // Unwind modifications array
          { $unwind: "$modifications" },

          // Filter for edit requests only
          { $match: { "modifications.field": "edit_request" } },

          // Add status filter if specified
          ...(status !== "all"
            ? [{ $match: { "modifications.status": status } }]
            : []),

          // Add request type filter if specified
          ...(requestType !== "all"
            ? [{ $match: { "modifications.requestType": requestType } }]
            : []),

          // Lookup user information
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },

          // Project the fields we need
          {
            $project: {
              bookingId: "$_id",
              destination: 1,
              startDate: 1,
              endDate: 1,
              status: 1,
              email: 1,
              totalPrice: 1,
              user: { $arrayElemAt: ["$user", 0] },
              editRequest: "$modifications",
              submittedAt: "$modifications.modifiedAt",
            },
          },

          // Sort
          {
            $sort: {
              [sortBy === "submittedAt" ? "submittedAt" : sortBy]:
                sortOrder === "asc" ? 1 : -1,
            },
          },
        ];

        // Get total count
        const totalPipeline = [...pipeline, { $count: "total" }];
        const totalResult = await Booking.aggregate(totalPipeline);
        const total = totalResult[0]?.total || 0;

        // Add pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        pipeline.push({ $skip: skip }, { $limit: limitNum });

        // Execute aggregation
        const editRequests = await Booking.aggregate(pipeline);

        // Format response
        const formattedRequests = editRequests.map((item) => ({
          id: item.editRequest._id,
          bookingId: item.bookingId,
          booking: {
            destination: item.destination,
            startDate: item.startDate,
            endDate: item.endDate,
            status: item.status,
            totalPrice: item.totalPrice,
          },
          user: {
            id: item.user?._id,
            name: item.user?.name,
            email: item.email,
            image: item.user?.image,
          },
          requestType: item.editRequest.requestType,
          status: item.editRequest.status,
          reason: item.editRequest.reason,
          requestedChanges: item.editRequest.newValue,
          submittedAt: item.editRequest.modifiedAt,
          resolvedAt: item.editRequest.resolvedAt,
          resolvedBy: item.editRequest.resolvedBy,
          adminNotes: item.editRequest.adminNotes,
          estimatedCost: item.editRequest.estimatedCost,
          userApproved: item.editRequest.userApproved,
          metadata: item.editRequest.metadata,
        }));

        // Get summary stats
        const stats = await Booking.aggregate([
          { $unwind: "$modifications" },
          { $match: { "modifications.field": "edit_request" } },
          {
            $group: {
              _id: "$modifications.status",
              count: { $sum: 1 },
            },
          },
        ]);

        const statusCounts = {
          pending: 0,
          processing: 0,
          cost_estimate_provided: 0,
          approved: 0,
          completed: 0,
          rejected: 0,
          cancelled: 0,
        };

        stats.forEach((stat) => {
          if (statusCounts.hasOwnProperty(stat._id)) {
            statusCounts[stat._id] = stat.count;
          }
        });

        logger.info("Admin edit requests fetched successfully", {
          count: formattedRequests.length,
          total,
          page: pageNum,
          adminId: session.user.id,
          requestId,
        });

        return res.status(200).json({
          editRequests: formattedRequests,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
            hasNext: pageNum * limitNum < total,
            hasPrev: pageNum > 1,
          },
          stats: statusCounts,
          requestId,
        });
      } catch (error) {
        logger.error("Error fetching edit requests in admin panel", error, {
          query: req.query,
          adminId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to fetch edit requests",
          message: "An error occurred while retrieving edit request data",
          requestId,
        });
      }
    }

    // Handle PUT requests - Process edit request
    if (req.method === "PUT") {
      try {
        const {
          bookingId,
          editRequestId,
          action,
          adminNotes,
          estimatedCost,
          newBookingData,
        } = req.body;

        // Validate IDs
        const bookingIdValidation = validateObjectId(bookingId);
        const editRequestIdValidation = validateObjectId(editRequestId);

        if (!bookingIdValidation.valid || !editRequestIdValidation.valid) {
          return res.status(400).json({
            error: "Invalid ID format",
            requestId,
          });
        }

        // Validate action
        const validActions = [
          "approve",
          "reject",
          "request_more_info",
          "provide_cost_estimate",
          "complete",
          "cancel",
        ];

        if (!validActions.includes(action)) {
          return res.status(400).json({
            error: "Invalid action",
            message: `Action must be one of: ${validActions.join(", ")}`,
            requestId,
          });
        }

        // Find booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          return res.status(404).json({
            error: "Booking not found",
            requestId,
          });
        }

        // Find edit request
        const editRequestIndex = booking.modifications.findIndex(
          (mod) =>
            mod._id?.toString() === editRequestId &&
            mod.field === "edit_request"
        );

        if (editRequestIndex === -1) {
          return res.status(404).json({
            error: "Edit request not found",
            requestId,
          });
        }

        const editRequest = booking.modifications[editRequestIndex];

        // Process the action
        switch (action) {
          case "approve":
            if (editRequest.status === "pending") {
              editRequest.status = "approved";
              editRequest.adminNotes = adminNotes;
              editRequest.resolvedBy = session.user.id;
            } else {
              return res.status(400).json({
                error: "Can only approve pending requests",
                requestId,
              });
            }
            break;

          case "reject":
            editRequest.status = "rejected";
            editRequest.adminNotes = adminNotes;
            editRequest.resolved = true;
            editRequest.resolvedAt = new Date();
            editRequest.resolvedBy = session.user.id;
            break;

          case "request_more_info":
            editRequest.status = "more_info_requested";
            editRequest.adminNotes = adminNotes;
            editRequest.resolvedBy = session.user.id;
            break;

          case "provide_cost_estimate":
            if (!estimatedCost || estimatedCost < 0) {
              return res.status(400).json({
                error: "Valid estimated cost is required",
                requestId,
              });
            }
            editRequest.status = "cost_estimate_provided";
            editRequest.estimatedCost = estimatedCost;
            editRequest.adminNotes = adminNotes;
            editRequest.resolvedBy = session.user.id;
            break;

          case "complete":
            // Apply the actual changes to the booking
            if (newBookingData) {
              // Store old values for audit
              editRequest.oldValue = {
                startDate: booking.startDate,
                endDate: booking.endDate,
                hotel: booking.hotel,
                activities: booking.activities,
                specialRequests: booking.specialRequests,
              };

              // Apply new values
              if (newBookingData.startDate)
                booking.startDate = new Date(newBookingData.startDate);
              if (newBookingData.endDate)
                booking.endDate = new Date(newBookingData.endDate);
              if (newBookingData.hotel)
                booking.hotel = { ...booking.hotel, ...newBookingData.hotel };
              if (newBookingData.activities)
                booking.activities = newBookingData.activities;
              if (newBookingData.specialRequests)
                booking.specialRequests = newBookingData.specialRequests;
              if (newBookingData.totalPrice)
                booking.totalPrice = newBookingData.totalPrice;

              // Update price breakdown if cost changed
              if (estimatedCost && estimatedCost !== 0) {
                booking.priceBreakdown.fees =
                  (booking.priceBreakdown.fees || 0) + estimatedCost;
                booking.totalPrice = (booking.totalPrice || 0) + estimatedCost;
              }
            }

            editRequest.status = "completed";
            editRequest.resolved = true;
            editRequest.resolvedAt = new Date();
            editRequest.resolvedBy = session.user.id;
            editRequest.adminNotes = adminNotes;
            break;

          case "cancel":
            editRequest.status = "cancelled";
            editRequest.resolved = true;
            editRequest.resolvedAt = new Date();
            editRequest.resolvedBy = session.user.id;
            editRequest.adminNotes = adminNotes;
            break;
        }

        // Save the booking
        await booking.save();

        // Log the admin action
        logger.info("Edit request processed by admin", {
          bookingId,
          editRequestId,
          action,
          adminId: session.user.id,
          newStatus: editRequest.status,
          requestId,
        });

        // Optional: Send notification to user
        // await sendEditRequestUpdateNotification(booking, editRequest, action);

        return res.status(200).json({
          success: true,
          message: `Edit request ${action}d successfully`,
          editRequest: {
            id: editRequest._id,
            status: editRequest.status,
            adminNotes: editRequest.adminNotes,
            estimatedCost: editRequest.estimatedCost,
            resolvedAt: editRequest.resolvedAt,
            resolvedBy: editRequest.resolvedBy,
          },
          booking: {
            id: booking._id,
            destination: booking.destination,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalPrice: booking.totalPrice,
            status: booking.status,
          },
          requestId,
        });
      } catch (error) {
        logger.error("Error processing edit request", error, {
          body: req.body,
          adminId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to process edit request",
          message: "An error occurred while processing the edit request",
          requestId,
        });
      }
    }
  } catch (error) {
    logger.error("Unexpected error in admin edit requests API", error, {
      requestId,
    });

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      requestId,
    });
  }
}
