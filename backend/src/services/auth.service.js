import { randomInt } from "node:crypto";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { sendVerificationOTP } from "../integrations/email/email.service.js";
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
  hashPassword,
  publicUser,
} from "../utils/auth.js";

const OTP_TTL = 10 * 60 * 1000;
const RESEND_COOLDOWN = 60 * 1000;
const MAX_ATTEMPTS = 5;

const normalizeEmail = (email) => email.trim().toLowerCase();
const httpError = (statusCode, code, message, details = {}) =>
  Object.assign(new Error(message), { statusCode, code, details });
const createOTP = () => String(randomInt(100000, 1000000));

export function isAdminLoginCredentials(email, password) {
  return (
    normalizeEmail(email) === normalizeEmail(env.adminId) &&
    String(password) === String(env.adminPassword)
  );
}

async function issueVerificationOTP(user) {
  const otp = createOTP();
  user.emailVerificationOTPHash = await hashPassword(otp);
  user.emailVerificationOTPExpiresAt = new Date(Date.now() + OTP_TTL);
  user.emailVerificationAttempts = 0;
  user.emailVerificationLastSentAt = new Date();
  await user.save();
  await sendVerificationOTP(user.email, otp);
}

export async function signup({ name, email, phone, password }) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser)
    throw httpError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "An account with this email already exists.",
    );
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone,
    passwordHash: await hashPassword(password),
    roles: ["USER"],
    emailVerified: false,
    accountStatus: "PENDING_VERIFICATION",
    authProvider: "local",
  });
  try {
    await issueVerificationOTP(user);
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw error;
  }
  return { message: "Verification code sent to your email." };
}

export async function verifyEmail(email, otp) {
  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user)
    throw httpError(
      400,
      "INVALID_OTP",
      "The verification code is invalid or expired.",
    );
  if (user.emailVerified)
    throw httpError(
      400,
      "EMAIL_ALREADY_VERIFIED",
      "This email is already verified.",
    );
  if (!user.emailVerificationOTPHash)
    throw httpError(
      400,
      "INVALID_OTP",
      "The verification code is invalid or expired.",
    );
  if (user.emailVerificationAttempts >= MAX_ATTEMPTS) {
    user.emailVerificationOTPHash = undefined;
    await user.save();
    throw httpError(
      429,
      "OTP_TOO_MANY_ATTEMPTS",
      "Too many attempts. Request a new verification code.",
    );
  }
  if (
    !user.emailVerificationOTPExpiresAt ||
    user.emailVerificationOTPExpiresAt < new Date()
  )
    throw httpError(400, "OTP_EXPIRED", "The verification code has expired.");
  user.emailVerificationAttempts += 1;
  if (!(await comparePassword(otp, user.emailVerificationOTPHash))) {
    await user.save();
    throw httpError(400, "INVALID_OTP", "The verification code is invalid.");
  }
  user.emailVerified = true;
  user.accountStatus = "ACTIVE";
  user.emailVerificationOTPHash = undefined;
  user.emailVerificationOTPExpiresAt = undefined;
  user.emailVerificationAttempts = 0;
  user.emailVerificationLastSentAt = undefined;
  await user.save();
  return createSession(user);
}

export async function resendOTP(email) {
  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user || user.emailVerified)
    throw httpError(
      400,
      "INVALID_REQUEST",
      "Unable to resend a verification code.",
    );
  const remaining = user.emailVerificationLastSentAt
    ? RESEND_COOLDOWN -
      (Date.now() - user.emailVerificationLastSentAt.getTime())
    : 0;
  if (remaining > 0)
    throw httpError(
      429,
      "OTP_RESEND_COOLDOWN",
      "Please wait before requesting another code.",
      { retryAfterSeconds: Math.ceil(remaining / 1000) },
    );
  await issueVerificationOTP(user);
  return { message: "A new verification code has been sent." };
}

export async function login(email, password) {
  const normalizedEmail = normalizeEmail(email);
  if (isAdminLoginCredentials(normalizedEmail, password)) {
    const adminUser = await User.findOne({ email: normalizedEmail });
    const existingAdmin = adminUser ||
      (await User.create({
        name: "Admin",
        email: normalizedEmail,
        roles: ["ADMIN"],
        latitude: null,
        longitude: null,
        location: undefined,
        emailVerified: true,
        accountStatus: "ACTIVE",
        authProvider: "local",
        passwordHash: await hashPassword(String(password)),
      }));

    if (existingAdmin.roles && !existingAdmin.roles.includes("ADMIN")) {
      existingAdmin.roles = [...new Set([...existingAdmin.roles, "ADMIN"])];
      await existingAdmin.save();
    }

    return createSession(existingAdmin);
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (
    !user ||
    !user.passwordHash ||
    !(await comparePassword(password, user.passwordHash))
  )
    throw httpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  if (!user.emailVerified || user.accountStatus === "PENDING_VERIFICATION")
    throw httpError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Please verify your email before signing in.",
    );
  if (user.accountStatus === "SUSPENDED")
    throw httpError(403, "ACCOUNT_SUSPENDED", "This account is suspended.");
  return createSession(user);
}

export function createSession(user) {
  return {
    user: publicUser(user),
    accessToken: createAccessToken({
      sub: user._id.toString(),
      roles: user.roles,
    }),
    refreshToken: createRefreshToken({ sub: user._id.toString() }),
  };
}
export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw httpError(401, "UNAUTHORIZED", "Authentication required.");
  return publicUser(user);
}
export async function googleUser(profile) {
  const email = normalizeEmail(profile.email);
  let user = await User.findOne({
    $or: [{ googleId: profile.googleId }, { email }],
  });
  if (!user)
    user = await User.create({
      name: profile.name,
      email,
      avatar: profile.avatar,
      roles: ["USER"],
      emailVerified: true,
      accountStatus: "ACTIVE",
      authProvider: "google",
      googleId: profile.googleId,
    });
  else {
    user.googleId = user.googleId || profile.googleId;
    user.authProvider =
      user.authProvider === "local" ? "both" : user.authProvider;
    user.emailVerified = true;
    user.accountStatus = "ACTIVE";
    await user.save();
  }
  return createSession(user);
}

export async function updateUserLocation(userId, data = {}) {
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw httpError(
      400,
      "INVALID_LOCATION",
      "Latitude and longitude must be valid numbers.",
    );
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw httpError(
      400,
      "INVALID_LOCATION",
      "Latitude and longitude must fall within valid ranges.",
    );
  }

  const user = await User.findById(userId);
  if (!user) throw httpError(404, "USER_NOT_FOUND", "User not found.");

  user.latitude = latitude;
  user.longitude = longitude;
  user.location = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
  user.city = String(data.city || user.city || "").trim();
  user.state = String(data.state || user.state || "").trim();
  user.country = String(data.country || user.country || "").trim();
  user.locationUpdatedAt = new Date();
  await user.save();

  return publicUser(user);
}
