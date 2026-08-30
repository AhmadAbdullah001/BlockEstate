import "dotenv/config";

const value = (name, fallback = "") => (process.env[name] || fallback).trim();

export const env = {
  port: Number(value("PORT", "5000")),
  nodeEnv: value("NODE_ENV", "development"),
  mongodbUri: value("MONGODB_URI"),
  jwtSecret: value("JWT_SECRET", "development-secret"),
  jwtExpiresIn: value("JWT_EXPIRES_IN", "15m"),
  jwtRefreshSecret: value("JWT_REFRESH_SECRET", "development-refresh-secret"),
  frontendUrl: value("FRONTEND_URL", "http://localhost:3000"),
  emailHost: value("EMAIL_HOST"),
  emailPort: Number(value("EMAIL_PORT", "587")),
  emailSecure: process.env.EMAIL_SECURE === "true",
  emailUser: value("EMAIL_USER"),
  emailPassword: value("EMAIL_PASSWORD").replace(/\s/g, ""),
  emailFrom: value("EMAIL_FROM"),
  googleClientId: value("GOOGLE_CLIENT_ID"),
  googleClientSecret: value("GOOGLE_CLIENT_SECRET"),
  googleCallbackUrl: value("GOOGLE_CALLBACK_URL"),
  cloudinaryCloudName: value("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: value("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: value("CLOUDINARY_API_SECRET"),
  adminId: value("Admin_id", "admin001@gmail.com"),
  adminPassword: value("Admin_password", "Admin@123"),
};
