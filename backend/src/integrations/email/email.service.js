import { createMailer } from "./mailer.js";
import { env } from "../../config/env.js";

export async function sendVerificationOTP(email, otp) {
  const mailer = createMailer();
  await mailer.sendMail({
    from: env.emailFrom,
    to: email,
    subject: "Your BlockEstate verification code",
    text: `Your BlockEstate verification code is ${otp}. This code expires in 10 minutes. If you did not request this code, you can safely ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif"><h1>BlockEstate</h1><p>Your verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${otp}</p><p>This code expires in 10 minutes.</p><p>If you did not request this code, you can safely ignore this email.</p></div>`,
  });
}

export async function sendAgentApprovalEmail(email, name) {
  const mailer = createMailer();
  await mailer.sendMail({
    from: env.emailFrom,
    to: email,
    subject: "Your BlockEstate agent account has been approved",
    text: `Hello ${name || "there"},\n\nYour BlockEstate agent application has been approved by the admin team. You can now log in to the Agent Portal and begin managing verifications.`,
    html: `<div style="font-family:Arial,sans-serif"><h1>BlockEstate</h1><p>Hello ${name || "there"},</p><p>Your BlockEstate agent application has been approved by the admin team.</p><p>You can now log in to the Agent Portal and begin managing verifications.</p></div>`,
  });
}
