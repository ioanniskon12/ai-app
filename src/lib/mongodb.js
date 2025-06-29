// lib/mongodb.js - Enhanced MongoDB connection with proper error handling
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      // Add retry logic
      retryWrites: true,
      retryReads: true,
      // Heartbeat frequency
      heartbeatFrequencyMS: 10000,
      // Use new URL parser
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    console.log("🔄 Connecting to MongoDB...");

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully");

        // Set up connection event listeners
        mongoose.connection.on("error", (error) => {
          console.error("❌ MongoDB connection error:", error);
        });

        mongoose.connection.on("disconnected", () => {
          console.warn("⚠️ MongoDB disconnected");
        });

        mongoose.connection.on("reconnected", () => {
          console.log("🔄 MongoDB reconnected");
        });

        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
        cached.promise = null; // Reset promise on failure
        throw new Error(`Database connection failed: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Database connection error:", e);

    // Provide more specific error messages
    if (e.message.includes("ECONNREFUSED")) {
      throw new Error(
        "Database connection refused. Please check if MongoDB is running."
      );
    } else if (e.message.includes("authentication failed")) {
      throw new Error(
        "Database authentication failed. Please check your credentials."
      );
    } else if (e.message.includes("timeout")) {
      throw new Error(
        "Database connection timeout. Please check your network connection."
      );
    } else {
      throw new Error(`Database connection failed: ${e.message}`);
    }
  }

  return cached.conn;
}

// Function to check connection status
export async function checkDbConnection() {
  try {
    await dbConnect();
    return {
      status: "connected",
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  } catch (error) {
    return {
      status: "disconnected",
      error: error.message,
    };
  }
}

// Function to gracefully close connection
export async function disconnectDb() {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("📴 MongoDB disconnected");
  }
}

// Export default connection function
export default dbConnect;

// MongoDB native client export (for aggregations and advanced operations)
import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  });
  clientPromise = client.connect();
}

export { clientPromise };
