// pages/api/stripe/create-checkout-session.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import Stripe from "stripe";
import { connectToDatabase } from "../../../lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { bookingId, tripData, passengers } = req.body;

    if (!bookingId || !tripData) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // Calculate total price
    const basePrice = parseInt(tripData.Price?.replace(/\D/g, "") || 0);
    const totalPassengers =
      (passengers?.adults || 1) + (passengers?.children || 0);
    const totalPrice = basePrice * totalPassengers;

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Trip to ${tripData.Destination}`,
            description: `${tripData.Duration} - ${tripData.Month}`,
            images: [tripData.DestinationImage],
          },
          unit_amount: totalPrice * 100, // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/booking/cancel?booking_id=${bookingId}`,
      customer_email: session.user.email,
      metadata: {
        bookingId: bookingId,
        userId: session.user.id,
        destination: tripData.Destination,
      },
    });

    // Update booking with Stripe session ID
    const { db } = await connectToDatabase();
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          stripeSessionId: checkoutSession.id,
          paymentStatus: "pending",
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}
