import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  // 1) Ensure the user is signed in via NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userEmail = session.user.email;
  const { id } = req.query; // this is the wishlist‐item _id

  // 2) Get the backend URL from env
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

  try {
    if (req.method === "DELETE") {
      // Forward DELETE to Express: /api/wishlist/:userEmail/:id
      const response = await fetch(
        `${BACKEND_URL}/api/wishlist/${encodeURIComponent(userEmail)}/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        console.error(
          `Backend DELETE /api/wishlist returned status ${response.status}`,
          responseData
        );
        return res.status(response.status).json(responseData);
      }

      return res.status(200).json(responseData);
    }

    // Other methods are not allowed here
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Wishlist API ([id].js) error:", error);
    return res.status(500).json({ error: "Failed to remove from wishlist" });
  }
}
