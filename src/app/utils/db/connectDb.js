import mongoose from "mongoose";
import "./allModels.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined");
}

// Global cache (prevents re-connecting & re-attaching listeners)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    listenersAttached: false,
  };
}

export async function dbConnect() {
  // Already connected
  if (cached.conn) {
    return cached.conn;
  }

  // Create connection once
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  // Attach listeners ONLY ONCE
  if (!cached.listenersAttached) {
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });

    cached.listenersAttached = true;
  }

  return cached.conn;
}
