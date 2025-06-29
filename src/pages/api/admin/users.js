// pages/api/admin/users.js - Fixed admin users API with standardized imports
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User"; // ✅ Fixed import path - standardized to @/models/
import { logger } from "@/lib/logger";
import { validateObjectId, validateApiRequest } from "@/lib/validation";

export default async function handler(req, res) {
  const requestId = `admin-users-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.apiRequest(req, { requestId, endpoint: "admin/users" });

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
      logger.warn("Non-admin user attempted to access admin endpoint", {
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
      logger.debug("Database connected for admin users API", { requestId });
    } catch (dbError) {
      logger.error("Database connection failed in admin users API", dbError, {
        requestId,
      });
      return res.status(503).json({
        error: "Service temporarily unavailable",
        message: "Unable to connect to database. Please try again later.",
        requestId,
      });
    }

    // Handle GET requests - Fetch users
    if (req.method === "GET") {
      try {
        const {
          page = 1,
          limit = 20,
          search = "",
          role = "",
          status = "",
          sortBy = "createdAt",
          sortOrder = "desc",
        } = req.query;

        // Build filter query
        const filter = {};

        // Search filter
        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ];
        }

        // Role filter
        if (role && role !== "all") {
          filter.role = role;
        }

        // Status filter
        if (status) {
          switch (status) {
            case "active":
              filter.emailVerified = true;
              filter.lockUntil = { $exists: false };
              break;
            case "unverified":
              filter.emailVerified = false;
              break;
            case "locked":
              filter.lockUntil = { $exists: true, $gt: new Date() };
              break;
          }
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 users per page
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        const sortOptions = {};
        const validSortFields = [
          "createdAt",
          "name",
          "email",
          "lastLogin",
          "role",
        ];
        const sortField = validSortFields.includes(sortBy)
          ? sortBy
          : "createdAt";
        const sortDirection = sortOrder === "asc" ? 1 : -1;
        sortOptions[sortField] = sortDirection;

        // Get total count
        const totalUsers = await User.countDocuments(filter);

        // Fetch users (excluding sensitive fields)
        const users = await User.find(filter)
          .select(
            "-password -emailVerificationToken -passwordResetToken -twoFactorSecret"
          )
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean();

        // Get user stats
        const stats = await User.getStats();

        logger.info("Admin users fetched successfully", {
          count: users.length,
          total: totalUsers,
          page: pageNum,
          adminId: session.user.id,
          requestId,
        });

        return res.status(200).json({
          users,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalUsers,
            pages: Math.ceil(totalUsers / limitNum),
            hasNext: pageNum * limitNum < totalUsers,
            hasPrev: pageNum > 1,
          },
          stats,
          requestId,
        });
      } catch (error) {
        logger.error("Error fetching users in admin panel", error, {
          query: req.query,
          adminId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to fetch users",
          message: "An error occurred while retrieving user data",
          requestId,
        });
      }
    }

    // Handle PUT requests - Update user
    if (req.method === "PUT") {
      try {
        const { userId } = req.query;
        const updateData = req.body;

        // Validate user ID
        const idValidation = validateObjectId(userId);
        if (!idValidation.valid) {
          return res.status(400).json({
            error: "Invalid user ID format",
            requestId,
          });
        }

        // Prevent admin from modifying themselves in certain ways
        if (userId === session.user.id) {
          if (updateData.role && updateData.role !== "admin") {
            return res.status(403).json({
              error: "Cannot remove your own admin privileges",
              requestId,
            });
          }
        }

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
          logger.warn("User not found for admin update", { userId, requestId });
          return res.status(404).json({
            error: "User not found",
            requestId,
          });
        }

        // Allowed fields for admin update
        const allowedUpdates = [
          "name",
          "role",
          "emailVerified",
          "preferences",
          "profile",
        ];

        // Filter update data to only allowed fields
        const filteredUpdates = {};
        allowedUpdates.forEach((field) => {
          if (updateData[field] !== undefined) {
            filteredUpdates[field] = updateData[field];
          }
        });

        // Special handling for unlocking user
        if (updateData.unlock === true) {
          filteredUpdates.lockUntil = undefined;
          filteredUpdates.loginAttempts = 0;
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            ...filteredUpdates,
            updatedAt: new Date(),
          },
          {
            new: true,
            select:
              "-password -emailVerificationToken -passwordResetToken -twoFactorSecret",
          }
        );

        logger.info("User updated by admin", {
          updatedUserId: userId,
          adminId: session.user.id,
          updates: Object.keys(filteredUpdates),
          requestId,
        });

        return res.status(200).json({
          success: true,
          user: updatedUser,
          message: "User updated successfully",
          requestId,
        });
      } catch (error) {
        logger.error("Error updating user in admin panel", error, {
          userId: req.query.userId,
          adminId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to update user",
          message: "An error occurred while updating the user",
          requestId,
        });
      }
    }

    // Handle DELETE requests - Delete user
    if (req.method === "DELETE") {
      try {
        const { userId } = req.query;

        // Validate user ID
        const idValidation = validateObjectId(userId);
        if (!idValidation.valid) {
          return res.status(400).json({
            error: "Invalid user ID format",
            requestId,
          });
        }

        // Prevent admin from deleting themselves
        if (userId === session.user.id) {
          return res.status(403).json({
            error: "Cannot delete your own account",
            requestId,
          });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
          logger.warn("User not found for admin deletion", {
            userId,
            requestId,
          });
          return res.status(404).json({
            error: "User not found",
            requestId,
          });
        }

        // Prevent deletion of other admins (optional safety measure)
        if (user.role === "admin") {
          return res.status(403).json({
            error: "Cannot delete other admin accounts",
            message: "Please contact system administrator",
            requestId,
          });
        }

        // Delete user
        await User.findByIdAndDelete(userId);

        logger.info("User deleted by admin", {
          deletedUserId: userId,
          deletedUserEmail: user.email,
          adminId: session.user.id,
          requestId,
        });

        return res.status(200).json({
          success: true,
          message: "User deleted successfully",
          requestId,
        });
      } catch (error) {
        logger.error("Error deleting user in admin panel", error, {
          userId: req.query.userId,
          adminId: session.user.id,
          requestId,
        });

        return res.status(500).json({
          error: "Failed to delete user",
          message: "An error occurred while deleting the user",
          requestId,
        });
      }
    }
  } catch (error) {
    logger.error("Unexpected error in admin users API", error, { requestId });

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      requestId,
    });
  }
}
