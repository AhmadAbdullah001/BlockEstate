import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "../config/env.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { rateLimit } from "express-rate-limit";
import {
  emailSchema,
  loginSchema,
  signupSchema,
  verifyEmailSchema,
} from "../validators/auth.validator.js";
import * as controller from "../controllers/auth.controller.js";

const router = Router();
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

if (env.googleClientId && env.googleClientSecret && env.googleCallbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      (_accessToken, _refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account has no email"));
        return done(null, {
          googleId: profile.id,
          email,
          name: profile.displayName || "BlockEstate user",
          avatar: profile.photos?.[0]?.value,
        });
      },
    ),
  );
}

router.post(
  "/signup",
  authRateLimit,
  validate(signupSchema),
  controller.signup,
);
router.post(
  "/verify-email",
  otpRateLimit,
  validate(verifyEmailSchema),
  controller.verifyEmail,
);
router.post(
  "/resend-otp",
  otpRateLimit,
  validate(emailSchema),
  controller.resendOTP,
);
router.post("/login", authRateLimit, validate(loginSchema), controller.login);
router.post("/logout", controller.logout);
router.get("/me", authenticate, controller.getCurrentUser);
router.post("/location", authenticate, controller.updateLocation);
router.post(
  "/forgot-password",
  validate(emailSchema),
  controller.forgotPassword,
);
router.post("/reset-password", controller.resetPassword);
router.get("/google", (req, res, next) => {
  if (!env.googleClientId)
    return res.status(503).json({
      success: false,
      error: {
        code: "GOOGLE_NOT_CONFIGURED",
        message: "Google authentication is not configured.",
        details: {},
      },
    });
  return passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next,
  );
});
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/v1/auth/google/error",
  }),
  controller.googleCallback,
);
router.get("/google/error", controller.googleAuthError);

export default router;
