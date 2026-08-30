import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectDatabase() {
  if (!env.mongodbUri) {
    logger.error("MONGODB_URI is not configured. Database connection skipped.");
    return null;
  }
  return mongoose.connect(env.mongodbUri);
}
