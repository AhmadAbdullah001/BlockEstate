import { z } from "zod";
export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(8).max(100),
});
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
export const verifyEmailSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().regex(/^\d{6}$/),
});
export const emailSchema = z.object({ email: z.string().trim().email() });
