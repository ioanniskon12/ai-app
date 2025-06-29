// pages/api/bookings/edit-request.js - Booking edit request system
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { logger } from "@/lib/logger";
import { validateObjectId, validateApiRequest } from "@/lib/validation";

export default async function handler(req, res) {
  const requestId = `edit-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.apiRequest(req, { requestId, endpoint: "bookings/edit-request" });

  try {
    // Validate request method
    const methodValidation = validateApiRequest(req, ["POST", "GET", "PUT"]);
    if (!methodValidation.valid) {
      res.setHeader("Allow", ["POST", "GET", "PUT"]);
      return res.status(405).json({
        error: "Method not allowed",
        details: methodValidation.errors,
      });
    }

    // Get user session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      logger.warn("Unauthorized edit request attempt", { requestId });
      return res.status(401).json({
        error: "Authentication required",
        message: "Please log in to make edit requests",
        requestId,
      });
    }

    // Connect to database
    try {
      await dbConnect();
      logger.debug("Database connected for edit request API", { requestId });
    } catch (dbError) {
      logger.error("Database connection failed in edit request API", dbError, {
        requestId,
      });
      return res.status(503).json({
        error: "Service temporarily unavailable",
        message: "Unable to connect to database. Please try again later.",
        requestId,
      });
    }

    // Handle POST requests - Create edit request
    if (req.method === "POST") {
      try {
        const { bookingId, requestType, details, requestedChanges } = req.body;

        // Validate booking ID
        const idValidation = validateObjectId(bookingId);
        if (!idValidation.valid) {
          return res.status(400).json({
            error: "Invalid booking ID format",
            requestId,
          });
        }

        // Validate required fields
        if (!requestType || !details) {
          return res.status(400).json({
            error: "Missing required fields",
            message: "Request type and details are required",
            requestId,
          });
        }

        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          logger.warn("Booking not found for edit request", {
            bookingId,
            requestId,
          });
          return res.status(404).json({
            error: "Booking not found",
            requestId,
          });
        }

        // Check if user owns the booking
        const isOwner =
          booking.email === session.user.email ||
          booking.userId?.toString() === session.user.id;
        if (!isOwner) {
          logger.warn("Unauthorized edit request attempt", {
            bookingId,
            userId: session.user.id,
            bookingEmail: booking.email,
            userEmail: session.user.email,
            requestId,
          });

          return res.status(403).json({
            error: "Access denied",
            message: "You can only request edits for your own bookings",
            requestId,
          });
        }

        // Check if booking can be edited (not cancelled, not past)
        if (booking.status === "cancelled") {
          return res.status(400).json({
            error: "Cannot edit cancelled booking",
            message: "This booking has been cancelled and cannot be modified",
            requestId,
          });
        }

        if (booking.isPast) {
          return res.status(400).json({
            error: "Cannot edit past booking",
            message: "This booking has already ended and cannot be modified",
            requestId,
          });
        }

        // Check if there's already a pending edit request
        const existingPendingRequest = booking.modifications.find(
          (mod) =>
            mod.field === "edit_request" &&
            !mod.resolved &&
            mod.modifiedBy?.toString() === session.user.id
        );

        if (existingPendingRequest) {
          return res.status(409).json({
            error: "Pending edit request exists",
            message: "You already have a pending edit request for this booking",
            existingRequest: existingPendingRequest,
            requestId,
          });
        }

        // Validate request type
        const validRequestTypes = [
          "date_change",
          "hotel_change",
          "activity_change",
          "passenger_change",
          "special_requests",
          "other",
        ];

        if (!validRequestTypes.includes(requestType)) {
          return res.status(400).json({
            error: "Invalid request type",
            message: `Request type must be one of: ${validRequestTypes.join(", ")}`,
            requestId,
          });
        }

        // Create edit request modification
        const editRequest = {
          modifiedAt: new Date(),
          modifiedBy: session.user.id,
          field: "edit_request",
          oldValue: null, // Will be filled when processing
          newValue: requestedChanges || {},
          reason: details,
          requestType: requestType,
          status: "pending",
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
          adminNotes: null,
          estimatedCost: 0, // To be calculated by admin
          userApproved: null, // User approval for cost changes
          metadata: {
            userAgent: req.headers["user-agent"],
            ipAddress:
              req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
            submittedAt: new Date(),
          },
        };

        // Add the edit request to booking modifications
        booking.modifications.push(editRequest);
        await booking.save();

        // Send notification to admin (you can implement email/webhook here)
        logger.info("Edit request created", {
          bookingId,
          userId: session.user.id,
          requestType,
          requestId,
        });

        // Optional: Send email notification to admin
        // await sendEditRequestNotification(booking, editRequest, session.user);

        return res.status(201).json({
          success: true,
          message: "Edit request submitted successfully",
          editRequest: {
            id: editRequest._id,
            requestType: editRequest.requestType,
            status: editRequest.status,
            submittedAt: editRequest.modifiedAt,
            details: editRequest.reason,
          },
          booking: {
            id: booking._id,
            destination: booking.destination,
            startDate: booking.startDate,
            endDate: booking.endDate,
            status: booking.status,
          },
          requestId,
        });
      } catch (error) {
        logger.error("Error creating edit request", error, {
          bookingId: req.body?.bookingId,
          userId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to create edit request",
          message: "An error occurred while submitting your edit request",
          requestId,
        });
      }
    }

    // Handle GET requests - Fetch edit requests
    if (req.method === "GET") {
      try {
        const { bookingId, status = "all" } = req.query;

        let filter = {};

        // If bookingId is provided, get requests for specific booking
        if (bookingId) {
          const idValidation = validateObjectId(bookingId);
          if (!idValidation.valid) {
            return res.status(400).json({
              error: "Invalid booking ID format",
              requestId,
            });
          }

          // Find the booking and check ownership
          const booking = await Booking.findById(bookingId);
          if (!booking) {
            return res.status(404).json({
              error: "Booking not found",
              requestId,
            });
          }

          const isOwner =
            booking.email === session.user.email ||
            booking.userId?.toString() === session.user.id;
          const isAdmin = session.user.role === "admin";

          if (!isOwner && !isAdmin) {
            return res.status(403).json({
              error: "Access denied",
              message: "You can only view edit requests for your own bookings",
              requestId,
            });
          }

          // Filter edit requests from booking modifications
          let editRequests = booking.modifications.filter(
            (mod) => mod.field === "edit_request"
          );

          // Filter by status if specified
          if (status !== "all") {
            editRequests = editRequests.filter((req) => req.status === status);
          }

          return res.status(200).json({
            editRequests: editRequests.map((req) => ({
              id: req._id,
              requestType: req.requestType,
              status: req.status,
              reason: req.reason,
              requestedChanges: req.newValue,
              submittedAt: req.modifiedAt,
              resolvedAt: req.resolvedAt,
              adminNotes: req.adminNotes,
              estimatedCost: req.estimatedCost,
              userApproved: req.userApproved,
            })),
            booking: {
              id: booking._id,
              destination: booking.destination,
              startDate: booking.startDate,
              endDate: booking.endDate,
              status: booking.status,
            },
            requestId,
          });
        } else {
          // Get all edit requests for user's bookings
          const userBookings = await Booking.find({
            $or: [{ email: session.user.email }, { userId: session.user.id }],
          }).select("_id destination startDate endDate status modifications");

          const allEditRequests = [];

          userBookings.forEach((booking) => {
            const editRequests = booking.modifications
              .filter((mod) => mod.field === "edit_request")
              .filter((req) => status === "all" || req.status === status);

            editRequests.forEach((req) => {
              allEditRequests.push({
                id: req._id,
                bookingId: booking._id,
                destination: booking.destination,
                startDate: booking.startDate,
                endDate: booking.endDate,
                bookingStatus: booking.status,
                requestType: req.requestType,
                status: req.status,
                reason: req.reason,
                submittedAt: req.modifiedAt,
                resolvedAt: req.resolvedAt,
                estimatedCost: req.estimatedCost,
                userApproved: req.userApproved,
              });
            });
          });

          // Sort by submission date (newest first)
          allEditRequests.sort(
            (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
          );

          return res.status(200).json({
            editRequests: allEditRequests,
            total: allEditRequests.length,
            requestId,
          });
        }
      } catch (error) {
        logger.error("Error fetching edit requests", error, {
          query: req.query,
          userId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to fetch edit requests",
          message: "An error occurred while retrieving edit requests",
          requestId,
        });
      }
    }

    // Handle PUT requests - Update edit request (user approval/cancellation)
    if (req.method === "PUT") {
      try {
        const { bookingId, editRequestId, action, userApproval } = req.body;

        // Validate IDs
        const bookingIdValidation = validateObjectId(bookingId);
        const editRequestIdValidation = validateObjectId(editRequestId);

        if (!bookingIdValidation.valid || !editRequestIdValidation.valid) {
          return res.status(400).json({
            error: "Invalid ID format",
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

        // Check ownership
        const isOwner =
          booking.email === session.user.email ||
          booking.userId?.toString() === session.user.id;
        if (!isOwner) {
          return res.status(403).json({
            error: "Access denied",
            message: "You can only update your own edit requests",
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

        // Handle different actions
        switch (action) {
          case "cancel":
            if (editRequest.status !== "pending") {
              return res.status(400).json({
                error: "Can only cancel pending requests",
                requestId,
              });
            }
            editRequest.status = "cancelled";
            editRequest.resolvedAt = new Date();
            editRequest.resolved = true;
            break;

          case "approve_cost":
            if (editRequest.status !== "cost_estimate_provided") {
              return res.status(400).json({
                error: "No cost estimate to approve",
                requestId,
              });
            }
            editRequest.userApproved = userApproval;
            editRequest.status = userApproval ? "approved" : "rejected";
            if (!userApproval) {
              editRequest.resolved = true;
              editRequest.resolvedAt = new Date();
            }
            break;

          default:
            return res.status(400).json({
              error: "Invalid action",
              message: "Action must be 'cancel' or 'approve_cost'",
              requestId,
            });
        }

        await booking.save();

        logger.info("Edit request updated by user", {
          bookingId,
          editRequestId,
          action,
          userId: session.user.id,
          requestId,
        });

        return res.status(200).json({
          success: true,
          message: `Edit request ${action}d successfully`,
          editRequest: {
            id: editRequest._id,
            status: editRequest.status,
            userApproved: editRequest.userApproved,
            resolvedAt: editRequest.resolvedAt,
          },
          requestId,
        });
      } catch (error) {
        logger.error("Error updating edit request", error, {
          body: req.body,
          userId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to update edit request",
          message: "An error occurred while updating the edit request",
          requestId,
        });
      }
    }
  } catch (error) {
    logger.error("Unexpected error in edit request API", error, { requestId });

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      requestId,
    });
  }
}

// Helper function to send edit request notification (implement as needed)
async function sendEditRequestNotification(booking, editRequest, user) {
  // Implementation for sending email/webhook notifications to admin
  // You can integrate with your email service here
  logger.info("Edit request notification should be sent", {
    bookingId: booking._id,
    requestType: editRequest.requestType,
    userEmail: user.email,
  });
}
