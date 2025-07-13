// pages/api/wishlist.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

// Simple Wishlist Schema
const WishlistItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  tripData: {
    destination: String,
    destinationImage: String,
    month: String,
    duration: String,
    price: String,
    basePrice: Number,
    hotel: mongoose.Schema.Types.Mixed,
    activities: [String],
    startDate: Date,
    endDate: Date,
    reason: String,
  },
  notes: String,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create or get model
const Wishlist =
  mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistItemSchema);

export default async function handler(req, res) {
  // Get session
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Please login to manage wishlist" });
  }

  // Connect to database
  await dbConnect();

  const { method } = req;
  const userId = session.user.id || session.user.email;
  const email = session.user.email;

  switch (method) {
    case "GET":
      try {
        // Get all wishlist items for user
        const items = await Wishlist.find({ email }).sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          items,
          count: items.length,
        });
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        return res.status(500).json({ error: "Failed to fetch wishlist" });
      }

    case "POST":
      try {
        const { tripData, notes, priority } = req.body;

        if (!tripData?.destination) {
          return res
            .status(400)
            .json({ error: "Trip destination is required" });
        }

        // Check if already in wishlist
        const existing = await Wishlist.findOne({
          email,
          "tripData.destination": tripData.destination,
          "tripData.month": tripData.month,
        });

        if (existing) {
          return res.status(409).json({ error: "Trip already in wishlist" });
        }

        // Create new wishlist item
        const newItem = await Wishlist.create({
          userId,
          email,
          tripData,
          notes,
          priority,
        });

        return res.status(201).json({
          success: true,
          message: "Added to wishlist",
          item: newItem,
        });
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({ error: "Failed to add to wishlist" });
      }

    case "PUT":
      try {
        const { id } = req.query;
        const updates = req.body;

        if (!id) {
          return res.status(400).json({ error: "Item ID required" });
        }

        const updated = await Wishlist.findOneAndUpdate(
          { _id: id, email },
          updates,
          { new: true }
        );

        if (!updated) {
          return res.status(404).json({ error: "Wishlist item not found" });
        }

        return res.status(200).json({
          success: true,
          message: "Wishlist updated",
          item: updated,
        });
      } catch (error) {
        console.error("Error updating wishlist:", error);
        return res.status(500).json({ error: "Failed to update wishlist" });
      }

    case "DELETE":
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ error: "Item ID required" });
        }

        const deleted = await Wishlist.findOneAndDelete({ _id: id, email });

        if (!deleted) {
          return res.status(404).json({ error: "Wishlist item not found" });
        }

        return res.status(200).json({
          success: true,
          message: "Removed from wishlist",
        });
      } catch (error) {
        console.error("Error deleting from wishlist:", error);
        return res
          .status(500)
          .json({ error: "Failed to remove from wishlist" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
