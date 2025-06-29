// lib/validation.js - Input validation utilities

/**
 * Email validation using regex
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email.trim());

  return {
    valid: isValid,
    error: isValid ? null : "Please enter a valid email address",
  };
};

/**
 * Password validation
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return {
      valid: false,
      error: "Password must be at least 6 characters long",
    };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password must be less than 128 characters" };
  }

  return { valid: true, error: null };
};

/**
 * Name validation
 */
export const validateName = (name) => {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Name is required" };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters long" };
  }

  if (trimmedName.length > 50) {
    return { valid: false, error: "Name must be less than 50 characters" };
  }

  return { valid: true, error: null };
};

/**
 * Trip data validation
 */
export const validateTripData = (trip) => {
  const errors = [];

  // Required fields
  const requiredFields = ["Destination", "Month", "Duration"];
  const missing = requiredFields.filter((field) => !trip[field]);

  if (missing.length > 0) {
    errors.push(`Missing required fields: ${missing.join(", ")}`);
  }

  // Validate destination
  if (trip.Destination && typeof trip.Destination !== "string") {
    errors.push("Destination must be a string");
  } else if (trip.Destination && trip.Destination.trim().length < 2) {
    errors.push("Destination must be at least 2 characters long");
  }

  // Validate month
  if (trip.Month && typeof trip.Month !== "string") {
    errors.push("Month must be a string");
  }

  // Validate duration
  if (trip.Duration && typeof trip.Duration !== "string") {
    errors.push("Duration must be a string");
  }

  // Validate dates if provided
  if (trip.StartDate) {
    const startDate = new Date(trip.StartDate);
    if (isNaN(startDate.getTime())) {
      errors.push("Start date must be a valid date");
    } else if (startDate < new Date()) {
      errors.push("Start date cannot be in the past");
    }
  }

  if (trip.EndDate) {
    const endDate = new Date(trip.EndDate);
    if (isNaN(endDate.getTime())) {
      errors.push("End date must be a valid date");
    }

    if (trip.StartDate && trip.EndDate) {
      const startDate = new Date(trip.StartDate);
      const endDate = new Date(trip.EndDate);
      if (endDate <= startDate) {
        errors.push("End date must be after start date");
      }
    }
  }

  // Validate price if provided
  if (trip.Price !== undefined) {
    const price =
      typeof trip.Price === "string"
        ? parseInt(trip.Price.replace(/\D/g, ""), 10)
        : trip.Price;

    if (isNaN(price) || price < 0) {
      errors.push("Price must be a valid positive number");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

/**
 * Booking data validation
 */
export const validateBookingData = (booking) => {
  const errors = [];

  // Required fields for booking
  const requiredFields = ["email", "trip"];
  const missing = requiredFields.filter((field) => !booking[field]);

  if (missing.length > 0) {
    errors.push(`Missing required fields: ${missing.join(", ")}`);
  }

  // Validate email
  if (booking.email) {
    const emailValidation = validateEmail(booking.email);
    if (!emailValidation.valid) {
      errors.push(emailValidation.error);
    }
  }

  // Validate trip data
  if (booking.trip) {
    const tripValidation = validateTripData(booking.trip);
    if (!tripValidation.valid) {
      errors.push(...tripValidation.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

/**
 * User registration data validation
 */
export const validateUserRegistration = (userData) => {
  const errors = [];

  // Validate email
  const emailValidation = validateEmail(userData.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error);
  }

  // Validate password
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.error);
  }

  // Validate name
  const nameValidation = validateName(userData.name);
  if (!nameValidation.valid) {
    errors.push(nameValidation.error);
  }

  // Validate password confirmation if provided
  if (userData.confirmPassword !== undefined) {
    if (userData.password !== userData.confirmPassword) {
      errors.push("Passwords do not match");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

/**
 * MongoDB ObjectId validation
 */
export const validateObjectId = (id) => {
  if (!id) {
    return { valid: false, error: "ID is required" };
  }

  // Check if it's a valid ObjectId format (24 character hex string)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const isValid = objectIdRegex.test(id);

  return {
    valid: isValid,
    error: isValid ? null : "Invalid ID format",
  };
};

/**
 * File upload validation
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    required = false,
  } = options;

  if (!file && required) {
    return { valid: false, error: "File is required" };
  }

  if (!file && !required) {
    return { valid: true, error: null };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str) => {
  if (typeof str !== "string") return "";

  return str
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

/**
 * General API request validation
 */
export const validateApiRequest = (req, allowedMethods = ["GET", "POST"]) => {
  const errors = [];

  // Check HTTP method
  if (!allowedMethods.includes(req.method)) {
    errors.push(
      `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(", ")}`
    );
  }

  // Check Content-Type for POST requests
  if (req.method === "POST" && req.headers["content-type"]) {
    const contentType = req.headers["content-type"];
    if (!contentType.includes("application/json")) {
      errors.push("Content-Type must be application/json for POST requests");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};
