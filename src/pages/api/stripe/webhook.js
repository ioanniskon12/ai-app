// pages/api/stripe/webhook.js
import { buffer } from "micro";
import Stripe from "stripe";
import { connectToDatabase } from "../../../lib/mongodb";
import { sendBookingConfirmation } from "../../../lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      await handleSuccessfulPayment(session);
      break;

    case "checkout.session.expired":
      const expiredSession = event.data.object;
      await handleExpiredSession(expiredSession);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
}

async function handleSuccessfulPayment(session) {
  const { db } = await connectToDatabase();
  const { bookingId, userId } = session.metadata;

  try {
    // Update booking status
    const booking = await db.collection("bookings").findOneAndUpdate(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          paymentStatus: "paid",
          status: "confirmed",
          stripePaymentId: session.payment_intent,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (booking.value) {
      // Send confirmation email
      await sendBookingConfirmation(booking.value);

      // Update user stats
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $inc: { totalBookings: 1 },
          $set: { lastBookingDate: new Date() },
        }
      );
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleExpiredSession(session) {
  const { db } = await connectToDatabase();
  const { bookingId } = session.metadata;

  await db.collection("bookings").updateOne(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        paymentStatus: "expired",
        status: "cancelled",
        updatedAt: new Date(),
      },
    }
  );
}

async function handleFailedPayment(paymentIntent) {
  // Log failed payment attempts
  console.error("Payment failed:", paymentIntent.id);
}

// pages/api/stripe/create-payment-intent.js (Alternative to checkout session)
export async function createPaymentIntent(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount, currency = "usd", bookingId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        bookingId,
        userId: session.user.id,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
}
