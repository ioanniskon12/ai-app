// pages/api/webhooks/stripe.js - Send email ONLY after successful payment
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const resend = new Resend(process.env.RESEND_API_KEY || "");

// This is your Stripe CLI webhook secret or endpoint secret from the dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Stripe webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("💳 Payment successful for session:", session.id);

      // ONLY process if payment was actually successful
      if (session.payment_status === "paid") {
        await handleSuccessfulPayment(session);
      } else {
        console.warn(
          "⚠️ Checkout completed but payment not successful:",
          session.payment_status
        );
      }
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("✅ Payment intent succeeded:", paymentIntent.id);

      // Additional confirmation that payment was successful
      if (paymentIntent.status === "succeeded") {
        await handlePaymentIntentSuccess(paymentIntent);
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("❌ Payment failed:", failedPayment.id);
      await handlePaymentFailure(failedPayment);
      break;

    case "checkout.session.expired":
      const expiredSession = event.data.object;
      console.log("⏰ Checkout session expired:", expiredSession.id);
      await handleSessionExpired(expiredSession);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

// Handle successful payment - UPDATE BOOKING AND SEND EMAIL
async function handleSuccessfulPayment(session) {
  try {
    const bookingId = session.metadata.bookingId;
    const userEmail = session.metadata.userEmail;

    console.log("🔍 Processing successful payment for booking:", bookingId);

    // Update booking status in database
    const booking = await updateBookingStatus(bookingId, {
      status: "confirmed",
      paymentStatus: "paid",
      stripePaymentIntentId: session.payment_intent,
      paidAt: new Date(),
    });

    if (booking) {
      console.log("✅ Booking confirmed in database");

      // SEND EMAIL ONLY AFTER SUCCESSFUL PAYMENT
      try {
        await sendBookingConfirmationEmail(booking, session);
        console.log("📧 Confirmation email sent successfully");
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }
    } else {
      console.error("❌ Booking not found:", bookingId);
    }
  } catch (error) {
    console.error("❌ Error processing successful payment:", error);
  }
}

// Handle payment intent success (additional confirmation)
async function handlePaymentIntentSuccess(paymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId;

    if (bookingId) {
      await updateBookingStatus(bookingId, {
        status: "confirmed",
        paymentStatus: "paid",
        stripePaymentIntentId: paymentIntent.id,
        paidAt: new Date(),
      });

      console.log("✅ Payment intent success - booking updated");
    }
  } catch (error) {
    console.error("❌ Error handling payment intent success:", error);
  }
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId;

    if (bookingId) {
      await updateBookingStatus(bookingId, {
        status: "pending_payment",
        paymentStatus: "failed",
        updatedAt: new Date(),
      });

      console.log("❌ Payment failed - booking marked as failed");
    }
  } catch (error) {
    console.error("❌ Error handling payment failure:", error);
  }
}

// Handle session expired
async function handleSessionExpired(session) {
  try {
    const bookingId = session.metadata.bookingId;

    if (bookingId) {
      await updateBookingStatus(bookingId, {
        status: "pending_payment",
        paymentStatus: "failed",
        updatedAt: new Date(),
      });

      console.log("⏰ Session expired - booking kept as pending");
    }
  } catch (error) {
    console.error("❌ Error handling session expiry:", error);
  }
}

// Helper function to update booking status
async function updateBookingStatus(bookingId, updates) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    await dbConnect();

    const Booking = (await import("@/models/Booking")).default;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    return booking;
  } catch (error) {
    console.error("❌ Database update failed:", error);
    return null;
  }
}

// Function to send booking confirmation email
async function sendBookingConfirmationEmail(booking, stripeSession) {
  try {
    console.log("📧 Sending confirmation email to:", booking.email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .highlight { color: #667eea; font-weight: bold; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your dream trip is all set!</p>
            </div>
            
            <div class="content">
              <h2>Hi ${booking.email.split("@")[0]}!</h2>
              
              <p>Great news! Your booking has been confirmed and payment has been processed successfully.</p>
              
              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                
                <div class="detail-row">
                  <span>Booking ID:</span>
                  <span class="highlight">${booking._id}</span>
                </div>
                
                <div class="detail-row">
                  <span>Destination:</span>
                  <span class="highlight">${booking.destination}</span>
                </div>
                
                <div class="detail-row">
                  <span>Duration:</span>
                  <span>${booking.duration}</span>
                </div>
                
                <div class="detail-row">
                  <span>Month:</span>
                  <span>${booking.month}</span>
                </div>
                
                ${
                  booking.startDate
                    ? `
                <div class="detail-row">
                  <span>Travel Dates:</span>
                  <span>${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</span>
                </div>
                `
                    : ""
                }
                
                <div class="detail-row">
                  <span>Total Passengers:</span>
                  <span>${booking.passengers.adults + booking.passengers.children + booking.passengers.infants} (${booking.passengers.adults} adults, ${booking.passengers.children} children, ${booking.passengers.infants} infants)</span>
                </div>
                
                <div class="detail-row">
                  <span>Total Amount Paid:</span>
                  <span class="highlight">$${booking.totalPrice}</span>
                </div>
                
                <div class="detail-row">
                  <span>Payment Status:</span>
                  <span class="highlight">✅ Paid</span>
                </div>
              </div>

              ${
                booking.selectedActivities &&
                booking.selectedActivities.length > 0
                  ? `
              <div class="booking-details">
                <h3>🎯 Selected Activities</h3>
                ${booking.selectedActivities
                  .map(
                    (activity) => `
                  <div class="detail-row">
                    <span>${activity.name}</span>
                    <span>$${activity.price}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
              `
                  : ""
              }

              <p>
                <a href="${process.env.NEXT_PUBLIC_URL}/my-trips" class="button">
                  View Trip Details →
                </a>
              </p>

              <p><strong>What's next?</strong></p>
              <ul>
                <li>Check your trip details in your dashboard</li>
                <li>We'll send you travel documents closer to your departure date</li>
                <li>Contact us if you need to make any changes</li>
              </ul>

              <p>Have questions? Reply to this email or contact our support team.</p>
              
              <p>Safe travels!<br>
              <strong>The AI Travel Planner Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || "bookings@yourdomain.com",
      to: booking.email,
      subject: `🎉 Your trip to ${booking.destination} is confirmed!`,
      html: emailHtml,
    });

    console.log("✅ Email sent successfully:", result.id);
    return result;
  } catch (emailError) {
    console.error("❌ Failed to send confirmation email:", emailError);
    throw emailError;
  }
}

// Important: We need to parse the raw body for webhook verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
