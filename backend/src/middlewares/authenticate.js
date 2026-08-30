import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authenticate(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token)
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required",
        details: {},
      },
    });
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Authentication token is invalid",
        details: {},
      },
    });
  }
}
