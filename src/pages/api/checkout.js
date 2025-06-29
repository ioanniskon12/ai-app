// File: src/pages/api/checkout.js

import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1️⃣ Ensure user is signed in
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res
      .status(401)
      .json({ error: "Please sign in to continue to checkout." });
  }

  const { trip } = req.body;
  if (!trip?.Destination || !trip?.Price) {
    return res.status(400).json({ error: "Invalid trip data" });
  }

  try {
    // 2️⃣ Base trip price in cents
    const baseAmount = parseInt(trip.Price.replace(/[^0-9]/g, ""), 10) * 100;

    // 3️⃣ Any selected extras
    const extrasTotal = Array.isArray(trip.selectedActivities)
      ? trip.selectedActivities.reduce((sum, a) => {
          return sum + parseInt(a.price, 10) * 100;
        }, 0)
      : 0;

    const totalAmount = baseAmount + extrasTotal;

    // 4️⃣ Build a description string
    const descriptionLines = [
      `Dates: ${trip.StartDate}→${trip.EndDate}`,
      `Hotel: ${trip.Hotel}`,
      trip.Flight
        ? `Flight: Outbound ${trip.Flight.Outbound}, Return ${trip.Flight.Return}`
        : "",
      ...(trip.selectedActivities || []).map((a) => `${a.name}(+$${a.price})`),
    ].filter(Boolean);

    // 5️⃣ Create the Checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Trip to ${trip.Destination}`,
              description: descriptionLines.join(" · "),
              images: trip.DestinationImage ? [trip.DestinationImage] : [],
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      customer_email: session.user.email,
      // ← metadata removed so we don't exceed Stripe's 500-char limit
    });

    return res.status(200).json({ url: stripeSession.url });
  } catch (err) {
    console.error("🔥 /api/checkout error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Stripe creation failed" });
  }
}
