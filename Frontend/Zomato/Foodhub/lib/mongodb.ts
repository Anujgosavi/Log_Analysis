import mongoose from "mongoose";
import logger from "./logger";
import { config } from "process";

// Load environment variables from .env.local file

const MONGODB_URI = process.env.MONGODB_URI;

// Use global cache to prevent reinitialization during Next.js hot reloads
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("❌ Please define the MONGODB_URI environment variable");
  }

  if (cached.conn) {
    logger.info("Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    logger.info("Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // timeout safety
      })
      .then((mongoose) => {
        logger.info("MongoDB connected successfully");
        return mongoose;
      })
      .catch((err) => {
        logger.error("MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
