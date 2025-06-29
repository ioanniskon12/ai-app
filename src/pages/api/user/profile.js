// pages/api/user/profile.js
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await dbConnect();

  if (req.method === "GET") {
    try {
      const user = await User.findById(session.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  } else if (req.method === "PUT") {
    try {
      const allowedFields = [
        "name",
        "phone",
        "dateOfBirth",
        "bio",
        "address.street",
        "address.city",
        "address.state",
        "address.country",
        "address.postalCode",
      ];

      const updates = {};

      // Handle nested address fields
      if (req.body.address) {
        updates.address = req.body.address;
      }

      // Handle other fields
      Object.keys(req.body).forEach((key) => {
        if (allowedFields.includes(key) && key !== "address") {
          updates[key] = req.body[key];
        }
      });

      // Handle individual address fields
      if (req.body.city) updates["address.city"] = req.body.city;
      if (req.body.country) updates["address.country"] = req.body.country;
      if (req.body.postalCode)
        updates["address.postalCode"] = req.body.postalCode;

      const user = await User.findByIdAndUpdate(
        session.user.id,
        {
          $set: updates,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        error: "Failed to update profile",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
