import dbConnect from "../../../lib/mongodb";
import Booking from "@/models/Booking";
import { isValidObjectId } from "mongoose";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (!isValidObjectId(id))
    return res.status(400).json({ error: "Invalid ID" });

  if (req.method === "DELETE") {
    const { email } = req.query;
    const b = await Booking.findById(id);
    if (!b) return res.status(404).json({ error: "Not found" });
    if (email && b.email !== email)
      return res.status(403).json({ error: "Forbidden" });
    await Booking.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
