// models/User.js - Standardized User model
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
      select: false,
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      newsletter: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "USD",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
    profile: {
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      displayName: {
        type: String,
        trim: true,
      },
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      location: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      dateOfBirth: {
        type: Date,
        default: null,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-to-say"],
        default: null,
      },
      occupation: {
        type: String,
        trim: true,
      },
      company: {
        type: String,
        trim: true,
      },
    },
    travelPreferences: {
      preferredDestinations: [
        {
          type: String,
          trim: true,
        },
      ],
      budgetRange: {
        min: {
          type: Number,
          min: 0,
        },
        max: {
          type: Number,
          min: 0,
        },
        currency: {
          type: String,
          default: "USD",
        },
      },
      travelStyle: {
        type: String,
        enum: ["budget", "mid-range", "luxury", "backpacker", "business"],
        default: "mid-range",
      },
      accommodationType: [
        {
          type: String,
          enum: [
            "hotel",
            "hostel",
            "apartment",
            "resort",
            "bed-and-breakfast",
            "camping",
          ],
        },
      ],
      transportMode: [
        {
          type: String,
          enum: ["flight", "train", "bus", "car", "ship"],
        },
      ],
      groupSize: {
        type: String,
        enum: ["solo", "couple", "small-group", "large-group", "family"],
        default: "solo",
      },
      hasChildren: {
        type: Boolean,
        default: false,
      },
      childrenAges: [
        {
          type: Number,
          min: 0,
          max: 18,
        },
      ],
      accessibility: {
        wheelchairAccess: {
          type: Boolean,
          default: false,
        },
        mobilityAid: {
          type: Boolean,
          default: false,
        },
        visualImpairment: {
          type: Boolean,
          default: false,
        },
        hearingImpairment: {
          type: Boolean,
          default: false,
        },
        dietaryRestrictions: [
          {
            type: String,
            enum: [
              "vegetarian",
              "vegan",
              "gluten-free",
              "halal",
              "kosher",
              "diabetic",
              "other",
            ],
          },
        ],
        specialRequests: {
          type: String,
          maxlength: [500, "Special requests cannot exceed 500 characters"],
        },
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "premium", "pro"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled", "expired"],
        default: "active",
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      stripeCustomerId: {
        type: String,
        default: null,
        select: false,
      },
      stripeSubscriptionId: {
        type: String,
        default: null,
        select: false,
      },
    },
    stats: {
      totalBookings: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      countriesVisited: [
        {
          type: String,
          trim: true,
        },
      ],
      favoriteDestinations: [
        {
          destination: {
            type: String,
            trim: true,
          },
          visits: {
            type: Number,
            default: 1,
          },
        },
      ],
      averageRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    socialAccounts: {
      google: {
        id: {
          type: String,
          default: null,
        },
        email: {
          type: String,
          default: null,
        },
      },
      facebook: {
        id: {
          type: String,
          default: null,
        },
        email: {
          type: String,
          default: null,
        },
      },
      twitter: {
        id: {
          type: String,
          default: null,
        },
        username: {
          type: String,
          default: null,
        },
      },
    },
    privacy: {
      profileVisible: {
        type: Boolean,
        default: true,
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      showLocation: {
        type: Boolean,
        default: true,
      },
      allowMessages: {
        type: Boolean,
        default: true,
      },
      allowReviews: {
        type: Boolean,
        default: true,
      },
    },
    metadata: {
      source: {
        type: String,
        enum: ["web", "mobile", "api", "import"],
        default: "web",
      },
      referrer: {
        type: String,
        default: null,
      },
      utmSource: {
        type: String,
        default: null,
      },
      utmMedium: {
        type: String,
        default: null,
      },
      utmCampaign: {
        type: String,
        default: null,
      },
      ipAddress: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
      firstVisit: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.twoFactorSecret;
        delete ret.subscription.stripeCustomerId;
        delete ret.subscription.stripeSubscriptionId;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
// UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ emailVerified: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ "subscription.plan": 1 });
UserSchema.index({ "subscription.status": 1 });

// Compound indexes
UserSchema.index({ email: 1, emailVerified: 1 });
UserSchema.index({ role: 1, emailVerified: 1 });

// Virtual fields
UserSchema.virtual("fullName").get(function () {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.name;
});

UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.virtual("isActive").get(function () {
  return this.emailVerified && !this.isLocked;
});

UserSchema.virtual("age").get(function () {
  if (!this.profile.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.profile.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Pre-save middleware
UserSchema.pre("save", function (next) {
  // Update display name if not set
  if (!this.profile.displayName) {
    this.profile.displayName = this.fullName || this.name;
  }

  // Generate avatar if not set
  if (!this.image) {
    const name = encodeURIComponent(this.name);
    this.image = `https://ui-avatars.com/api/?name=${name}&background=667eea&color=fff&size=200`;
  }

  next();
});

// Static methods
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findActive = function () {
  return this.find({ emailVerified: true, lockUntil: { $exists: false } });
};

UserSchema.statics.findByRole = function (role) {
  return this.find({ role: role });
};

UserSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ["$emailVerified", true] }, 1, 0] },
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
        },
        premiumUsers: {
          $sum: { $cond: [{ $eq: ["$subscription.plan", "premium"] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalUsers: 0,
      verifiedUsers: 0,
      adminUsers: 0,
      premiumUsers: 0,
    }
  );
};

// Instance methods
UserSchema.methods.updateLoginAttempts = function (isSuccess = false) {
  if (isSuccess) {
    // Reset attempts on successful login
    if (this.loginAttempts > 0) {
      this.loginAttempts = 0;
      this.lockUntil = undefined;
    }
    this.lastLogin = new Date();
  } else {
    // Increment attempts on failed login
    this.loginAttempts += 1;

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    }
  }

  return this.save();
};

UserSchema.methods.updateStats = function (bookingData) {
  this.stats.totalBookings += 1;

  if (bookingData.totalPrice) {
    this.stats.totalSpent += bookingData.totalPrice;
  }

  if (
    bookingData.destination &&
    !this.stats.countriesVisited.includes(bookingData.destination)
  ) {
    this.stats.countriesVisited.push(bookingData.destination);
  }

  return this.save();
};

UserSchema.methods.canBook = function () {
  // Check if user can make bookings
  return this.emailVerified && !this.isLocked;
};

UserSchema.methods.hasRole = function (role) {
  return this.role === role;
};

UserSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

UserSchema.methods.isPremium = function () {
  return (
    this.subscription.plan !== "free" && this.subscription.status === "active"
  );
};

// Error handling
UserSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    next(new Error(message));
  } else {
    next(error);
  }
});

// Create model only if it doesn't exist (prevents re-compilation errors)
export default mongoose.models.User || mongoose.model("User", UserSchema);
