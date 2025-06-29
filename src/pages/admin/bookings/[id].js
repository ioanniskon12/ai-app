// pages/api/admin/bookings/[id].js
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking"; // Adjust the import path as necessary

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { id } = req.query;
  await dbConnect();

  if (req.method === "PUT") {
    try {
      const booking = await Booking.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  } else if (req.method === "DELETE") {
    try {
      const booking = await Booking.findByIdAndDelete(id);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
