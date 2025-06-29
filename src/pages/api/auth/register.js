// POST /api/auth/register
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
  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const hash = await bcrypt.hash(password, 12);
  await db.collection("users").insertOne({
    email,
    password: hash,
    createdAt: new Date(),
  });

  // return the user’s email so we can auto-login
  return res.status(201).json({ email });
}
