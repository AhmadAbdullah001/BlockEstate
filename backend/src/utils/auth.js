import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const comparePassword = (password, passwordHash) =>
  bcrypt.compare(password, passwordHash);
export const createAccessToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
export const createRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: "7d" });
export const generateOTP = () => String(randomInt(100000, 1000000));
export const publicUser = (user) => ({
  id: user._id?.toString() || user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  roles: user.roles,
  avatar: user.avatar,
  latitude: user.latitude ?? null,
  longitude: user.longitude ?? null,
  city: user.city || "",
  state: user.state || "",
  country: user.country || "",
  locationUpdatedAt: user.locationUpdatedAt || null,
  emailVerified: user.emailVerified,
  accountStatus: user.accountStatus,
});
