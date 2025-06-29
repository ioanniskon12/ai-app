// POST /api/auth/login
import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection("users").findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "No user found" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  // return their email for next-auth
  return res.status(200).json({ email: user.email });
}
