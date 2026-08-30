import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

export function createMailer() {
  if (!env.emailUser || !env.emailPassword || !env.emailFrom) {
    throw new Error(
      "Email delivery is not configured. Set EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM.",
    );
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.emailUser, pass: env.emailPassword },
  });
}
