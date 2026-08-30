import * as authService from "../services/auth.service.js";
import { env } from "../config/env.js";

const setSessionCookies = (res, session) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  res.cookie("accessToken", session.accessToken, {
    ...options,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", session.refreshToken, {
    ...options,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
const sendSession = (res, session, message = "Signed in successfully.") => {
  setSessionCookies(res, session);
  return res.json({ success: true, message, data: { user: session.user } });
};
const result = (res, message) => res.json({ success: true, message, data: {} });

export async function signup(req, res) {
  const data = await authService.signup(req.body);
  return result(res, data.message);
}
export async function verifyEmail(req, res) {
  return sendSession(
    res,
    await authService.verifyEmail(req.body.email, req.body.otp),
    "Email verified successfully.",
  );
}
export async function resendOTP(req, res) {
  const data = await authService.resendOTP(req.body.email);
  return result(res, data.message);
}
export async function login(req, res) {
  return sendSession(
    res,
    await authService.login(req.body.email, req.body.password),
  );
}
export function logout(_req, res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return result(res, "Logged out successfully.");
}
export async function getCurrentUser(req, res) {
  return res.json({
    success: true,
    data: { user: await authService.getUserById(req.user.sub) },
  });
}
export async function updateLocation(req, res) {
  const user = await authService.updateUserLocation(req.user.sub, req.body || {});
  return res.json({
    success: true,
    message: "Location updated successfully.",
    data: { user },
  });
}
export function forgotPassword(_req, res) {
  return res.status(501).json({
    success: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Password recovery is not implemented yet.",
      details: {},
    },
  });
}
export function resetPassword(_req, res) {
  return res.status(501).json({
    success: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Password reset is not implemented yet.",
      details: {},
    },
  });
}
export function googleAuthError(_req, res) {
  return res.redirect(`${env.frontendUrl}/login?error=GOOGLE_AUTH_FAILED`);
}
export async function googleCallback(req, res) {
  try {
    setSessionCookies(res, await authService.googleUser(req.user));
    return res.redirect(`${env.frontendUrl}/`);
  } catch {
    return res.redirect(`${env.frontendUrl}/login?error=GOOGLE_AUTH_FAILED`);
  }
}
