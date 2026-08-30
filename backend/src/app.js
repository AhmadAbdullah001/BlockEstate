import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import { rateLimit } from "express-rate-limit";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, message: "BlockEstate API is running" });
});

app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
