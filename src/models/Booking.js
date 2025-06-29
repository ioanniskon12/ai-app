// models/Booking.js - Hybrid model matching project structure
import mongoose from "mongoose";

// Flexible sub-schemas without strict validation for development
const FlightDetailsSchema = new mongoose.Schema(
  {
    Outbound: String,
    Return: String,
    airline: String,
    flightNumber: String,
    departure: mongoose.Schema.Types.Mixed,
    arrival: mongoose.Schema.Types.Mixed,
    duration: String,
    class: {
      type: String,
      enum: ["economy", "premium-economy", "business", "first"],
      default: "economy",
    },
  },
  { _id: false, strict: false }
);

const WeatherItemSchema = new mongoose.Schema(
  {
    date: String,
    temp: String,
    condition: String,
    icon: String,
    humidity: String,
  },
  { _id: false }
);

const ActivitySchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    childFriendly: { type: Boolean, default: false },
    category: String,
    duration: String,
    description: String,
  },
  { _id: false, strict: false }
);

const BookingSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Trip Identification
    tripId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values
    },
    bookingReference: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Trip Basic Information
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    destinationImage: String,
    month: String,
    reason: String,
    duration: String,
    startDate: Date,
    endDate: Date,

    // Travelers/Passengers
    passengers: {
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },

    // Flight (flexible to accept string or object)
    flight: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Hotel (flexible to accept string or object)
    hotel: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Activities - both simple and detailed
    activities: [String], // Simple list
    selectedActivities: [ActivitySchema], // Detailed with pricing

    // Weather Information
    weather: {
      forecast: [WeatherItemSchema],
      averageTemp: String,
      bestConditions: String,
      clothingAdvice: String,
      lastUpdated: { type: Date, default: Date.now },
    },

    // Family-Friendly Features
    hasChildren: {
      type: Boolean,
      default: false,
    },
    childFriendlyFeatures: [String],
    familyFeatures: {
      isFamily: { type: Boolean, default: false },
      childFriendlyActivities: [String],
    },

    // Pricing Information
    price: String, // Display format like "$2,500"
    basePrice: Number,
    totalPrice: Number,
    priceBreakdown: {
      basePrice: { type: Number, default: 0 },
      flights: { type: Number, default: 0 },
      hotel: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      discounts: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },

    // Payment Information - STRIPE ONLY
    paymentMethod: {
      type: String,
      enum: ["stripe", "test"],
      default: "stripe",
    },
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "failed",
        "refunded",
        "test_mode",
      ],
      default: "pending",
    },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    stripeCustomerId: String,
    paymentUrl: String,
    paidAt: Date,

    // Booking Status
    status: {
      type: String,
      enum: [
        "pending_payment",
        "confirmed",
        "cancelled",
        "completed",
        "refunded",
      ],
      default: "pending_payment",
    },

    // Search Context & Metadata
    originalSearchQuery: String,
    refinementHistory: [String],
    searchData: {
      query: String,
      passengers: {
        adults: Number,
        children: Number,
        infants: Number,
      },
      searchTimestamp: Date,
    },

    // Source tracking
    source: {
      type: String,
      enum: ["web", "mobile", "api", "admin"],
      default: "web",
    },

    // Cancellation Information
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: Date,
      cancelledBy: String,
      reason: String,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
      },
    },

    // Review Information
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      reviewedAt: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: false, // Allow additional fields not in schema
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for performance
BookingSchema.index({ email: 1, createdAt: -1 });
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ tripId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ destination: 1 });
BookingSchema.index({ startDate: 1 });
BookingSchema.index({ "passengers.children": 1, "passengers.infants": 1 }); // For family bookings

// Virtual fields
BookingSchema.virtual("totalDays").get(function () {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

BookingSchema.virtual("totalPassengers").get(function () {
  return (
    (this.passengers?.adults || 0) +
    (this.passengers?.children || 0) +
    (this.passengers?.infants || 0)
  );
});

BookingSchema.virtual("isFamilyTrip").get(function () {
  return (
    (this.passengers?.children || 0) > 0 || (this.passengers?.infants || 0) > 0
  );
});

BookingSchema.virtual("isUpcoming").get(function () {
  return this.startDate && this.startDate > new Date();
});

BookingSchema.virtual("isPast").get(function () {
  return this.endDate && this.endDate < new Date();
});

BookingSchema.virtual("isActive").get(function () {
  return ["pending_payment", "confirmed"].includes(this.status);
});

// Pre-save middleware
BookingSchema.pre("save", function (next) {
  // Generate booking reference if not exists
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingReference = `AT-${timestamp}-${random}`.toUpperCase();
  }

  // Generate tripId if not exists
  if (!this.tripId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.tripId = `TRIP-${timestamp}-${random}`.toUpperCase();
  }

  // Calculate total price if not set
  if (!this.totalPrice && this.priceBreakdown) {
    const breakdown = this.priceBreakdown;
    this.totalPrice =
      (breakdown.basePrice || 0) +
      (breakdown.flights || 0) +
      (breakdown.hotel || 0) +
      (breakdown.activities || 0) +
      (breakdown.taxes || 0) +
      (breakdown.fees || 0) -
      (breakdown.discounts || 0);
  }

  // Set family flags
  this.hasChildren =
    (this.passengers?.children || 0) > 0 || (this.passengers?.infants || 0) > 0;
  if (this.familyFeatures) {
    this.familyFeatures.isFamily = this.hasChildren;
  }

  next();
});

// Instance methods
BookingSchema.methods.markAsPaid = function (paymentIntentId) {
  this.paymentStatus = "paid";
  this.status = "confirmed";
  this.stripePaymentIntentId = paymentIntentId;
  this.paidAt = new Date();
  return this.save();
};

BookingSchema.methods.markAsFailed = function () {
  this.paymentStatus = "failed";
  this.status = "pending_payment";
  return this.save();
};

BookingSchema.methods.cancel = function (reason, cancelledBy) {
  this.cancellation = {
    isCancelled: true,
    cancelledAt: new Date(),
    reason: reason,
    cancelledBy: cancelledBy,
  };
  this.status = "cancelled";
  return this.save();
};

BookingSchema.methods.getHotelName = function () {
  if (typeof this.hotel === "string") {
    return this.hotel;
  } else if (this.hotel && typeof this.hotel === "object") {
    return this.hotel.name || this.hotel.Name || "Unknown Hotel";
  }
  return "No Hotel Selected";
};

// Static methods
BookingSchema.statics.findByEmail = function (email) {
  return this.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
};

BookingSchema.statics.findByUserId = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

BookingSchema.statics.findUpcoming = function (userId = null) {
  const query = {
    startDate: { $gt: new Date() },
    status: { $in: ["confirmed", "pending_payment"] },
    "cancellation.isCancelled": { $ne: true },
  };
  if (userId) query.userId = userId;
  return this.find(query).sort({ startDate: 1 });
};

// Export model
export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
