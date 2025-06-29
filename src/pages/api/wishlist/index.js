// ai-travel-planner/src/pages/api/wishlist/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  // 1) Require a valid NextAuth session
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userEmail = session.user.email;

  // 2) Determine backend URL
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

  try {
    if (req.method === "GET") {
      // --- Forward GET to Express ---
      const response = await fetch(
        `${BACKEND_URL}/api/wishlist?userEmail=${encodeURIComponent(userEmail)}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // If Express returned 404, return empty array
      if (response.status === 404) {
        return res.status(200).json({ items: [] });
      }
      if (!response.ok) {
        // For any other status ≠200, pipe the status & message
        let errText = "";
        try {
          errText = await response.text();
        } catch {}
        console.error(
          `Backend GET /api/wishlist returned ${response.status}:`,
          errText
        );
        return res
          .status(response.status)
          .json({ error: "Failed to fetch wishlist" });
      }

      // Safely parse JSON only if there is content
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn("GET /api/wishlist: invalid JSON from backend:", text);
        data = {};
      }
      return res.status(200).json(data);
    } else if (req.method === "POST") {
      // --- Forward POST to Express ---
      const { tripData } = req.body;
      if (!tripData) {
        return res.status(400).json({ error: "tripData is required" });
      }

      const response = await fetch(`${BACKEND_URL}/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, tripData }),
      });

      // Read the raw body (string)
      const text = await response.text();

      // Try parsing JSON if there is content
      let responseData = {};
      try {
        responseData = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn("POST /api/wishlist: invalid JSON from backend:", text);
        responseData = {};
      }

      if (!response.ok) {
        console.error(
          `Backend POST /api/wishlist returned ${response.status}:`,
          responseData
        );
        return res.status(response.status).json(responseData);
      }

      // On successful creation, Express returns { success: true, item: newItem }
      return res.status(201).json(responseData);
    } else {
      // Method not allowed
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Wishlist API (index.js) error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}
