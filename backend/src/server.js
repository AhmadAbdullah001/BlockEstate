import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
try {
  const connection = await connectDatabase();
  if (connection) logger.info("MongoDB connected successfully");
} catch (error) {
  logger.error(`MongoDB connection failed: ${error.message}`);
}

app.listen(env.port, () => {
  logger.info(`BlockEstate API listening on port ${env.port}`);
});
