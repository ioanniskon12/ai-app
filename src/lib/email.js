// lib/email.js - Complete email service implementation
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const emailTemplates = {
  bookingConfirmation: (booking) => ({
    subject: `Booking Confirmed: Trip to ${booking.destination}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; }
            .trip-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .detail-row:last-child { border-bottom: none; }
            .icon { width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ Your Trip is Confirmed!</h1>
              <p>Get ready for your adventure to ${booking.destination}</p>
            </div>
            
            <div class="content">
              <h2>Hi ${booking.userName},</h2>
              <p>Great news! Your booking has been confirmed and we're excited to help make your trip unforgettable.</p>
              
              <div class="trip-details">
                <h3>Trip Details</h3>
                <div class="detail-row">
                  <span>📍 Destination</span>
                  <strong>${booking.destination}</strong>
                </div>
                <div class="detail-row">
                  <span>📅 Dates</span>
                  <strong>${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</strong>
                </div>
                <div class="detail-row">
                  <span>⏱️ Duration</span>
                  <strong>${booking.duration}</strong>
                </div>
                <div class="detail-row">
                  <span>🏨 Hotel</span>
                  <strong>${booking.hotel}</strong>
                </div>
                <div class="detail-row">
                  <span>👥 Travelers</span>
                  <strong>${booking.travelers}</strong>
                </div>
                <div class="detail-row">
                  <span>💰 Total Price</span>
                  <strong>$${booking.totalPrice}</strong>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/trip/${booking._id}" class="button">View Your Trip</a>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>Check your trip details and download your itinerary</li>
                <li>Review the weather forecast and packing suggestions</li>
                <li>Explore available activities and make reservations</li>
                <li>Contact us if you need to make any changes</li>
              </ul>
              
              <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
              
              <p>Happy travels!<br>The AI Travel Planner Team</p>
            </div>
            
            <div class="footer">
              <p>© 2024 AI Travel Planner. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  welcomeEmail: (user) => ({
    subject: "Welcome to AI Travel Planner! 🌍",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AI Travel Planner!</h1>
              <p>Your journey to amazing trips starts here</p>
            </div>
            
            <div class="content">
              <h2>Hi ${user.name},</h2>
              <p>Welcome aboard! We're thrilled to have you join our community of smart travelers.</p>
              
              <div class="features">
                <div class="feature">
                  <h3>🤖 AI-Powered</h3>
                  <p>Get personalized trip recommendations</p>
                </div>
                <div class="feature">
                  <h3>⚡ Instant Booking</h3>
                  <p>Book your perfect trip in minutes</p>
                </div>
                <div class="feature">
                  <h3>👨‍👩‍👧‍👦 Family Friendly</h3>
                  <p>Special features for traveling with kids</p>
                </div>
                <div class="feature">
                  <h3>💰 Best Prices</h3>
                  <p>AI finds the best deals for you</p>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}" class="button">Start Planning Your Trip</a>
              </div>
              
              <h3>Getting Started</h3>
              <ol>
                <li>Tell us where you want to go (or let AI surprise you!)</li>
                <li>Review your personalized trip package</li>
                <li>Customize activities and preferences</li>
                <li>Book with confidence</li>
              </ol>
              
              <p>If you have any questions, we're here to help!</p>
              
              <p>Happy planning!<br>The AI Travel Planner Team</p>
            </div>
            
            <div class="footer">
              <p>© 2024 AI Travel Planner. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  passwordReset: (user, resetUrl) => ({
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
              <h2>Hi ${user.name},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
              
              <p>For security reasons, the reset link will only work once.</p>
              
              <p>Stay safe,<br>The AI Travel Planner Team</p>
            </div>
            
            <div class="footer">
              <p>© 2024 AI Travel Planner. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  tripReminder: (booking) => ({
    subject: `Your trip to ${booking.destination} is coming up!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; }
            .countdown { background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .countdown h2 { color: #667eea; font-size: 48px; margin: 0; }
            .checklist { background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎒 Trip Reminder</h1>
              <p>Your adventure is almost here!</p>
            </div>
            
            <div class="content">
              <h2>Hi ${booking.userName},</h2>
              
              <div class="countdown">
                <p>Your trip to</p>
                <h3>${booking.destination}</h3>
                <p>starts in</p>
                <h2>${booking.daysUntilTrip} days!</h2>
              </div>
              
              <div class="checklist">
                <h3>✓ Pre-Trip Checklist</h3>
                <ul>
                  <li>Check passport expiration date</li>
                  <li>Confirm flight details</li>
                  <li>Review hotel reservation</li>
                  <li>Book any activities in advance</li>
                  <li>Check weather forecast</li>
                  <li>Arrange travel insurance</li>
                  <li>Notify bank of travel plans</li>
                  <li>Download offline maps</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/trip/${booking._id}" class="button">View Trip Details</a>
              </div>
              
              <p>Safe travels!<br>The AI Travel Planner Team</p>
            </div>
            
            <div class="footer">
              <p>© 2024 AI Travel Planner. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Main email functions
export async function sendBookingConfirmation(booking) {
  try {
    const emailContent = emailTemplates.bookingConfirmation(booking);

    const data = await resend.emails.send({
      from: "AI Travel Planner <bookings@aitravelplanner.com>",
      to: [booking.userEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(user) {
  try {
    const emailContent = emailTemplates.welcomeEmail(user);

    const data = await resend.emails.send({
      from: "AI Travel Planner <welcome@aitravelplanner.com>",
      to: [user.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(user, resetToken) {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    const emailContent = emailTemplates.passwordReset(user, resetUrl);

    const data = await resend.emails.send({
      from: "AI Travel Planner <noreply@aitravelplanner.com>",
      to: [user.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}

export async function sendTripReminder(booking) {
  try {
    const startDate = new Date(booking.startDate);
    const today = new Date();
    const daysUntilTrip = Math.ceil(
      (startDate - today) / (1000 * 60 * 60 * 24)
    );

    const emailContent = emailTemplates.tripReminder({
      ...booking,
      daysUntilTrip,
    });

    const data = await resend.emails.send({
      from: "AI Travel Planner <reminders@aitravelplanner.com>",
      to: [booking.userEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending trip reminder:", error);
    return { success: false, error };
  }
}

// Batch email function for sending multiple emails
export async function sendBatchEmails(emails) {
  try {
    const data = await resend.batch.send(emails);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending batch emails:", error);
    return { success: false, error };
  }
}

// Email API endpoint - pages/api/email/send.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, data } = req.body;

  try {
    let result;

    switch (type) {
      case "booking_confirmation":
        result = await sendBookingConfirmation(data);
        break;
      case "welcome":
        result = await sendWelcomeEmail(data);
        break;
      case "password_reset":
        result = await sendPasswordResetEmail(data.user, data.token);
        break;
      case "trip_reminder":
        result = await sendTripReminder(data);
        break;
      default:
        return res.status(400).json({ error: "Invalid email type" });
    }

    if (result.success) {
      res
        .status(200)
        .json({ message: "Email sent successfully", data: result.data });
    } else {
      res
        .status(500)
        .json({ error: "Failed to send email", details: result.error });
    }
  } catch (error) {
    console.error("Email API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
