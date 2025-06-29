// pages/api/admin/users/[id].js
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { id } = req.query;
  await dbConnect();

  if (req.method === "GET") {
    try {
      const user = await User.findById(id).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  } else if (req.method === "PUT") {
    try {
      const updates = req.body;
      // Don't allow updating password through this endpoint
      delete updates.password;

      const user = await User.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  } else if (req.method === "DELETE") {
    try {
      // Don't allow admin to delete themselves
      if (id === session.user.id) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own account" });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
