import { Router } from "express";
import authRoutes from "./auth.routes.js";
import propertyRoutes from "./property.routes.js";
import adminRoutes from "./admin.routes.js";
import agentRoutes from "./agent.routes.js";

const router = Router();
const resources = [
  "users",
  "verifications",
  "inspections",
  "documents",
  "messages",
  "offers",
  "transactions",
  "lawyers",
  "payments",
  "notifications",
  "reviews",
  "admin",
];

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/agents", agentRoutes);
router.use("/admin", adminRoutes);

for (const resource of resources) {
  router.use(`/${resource}`, (_req, res) => {
    res.status(501).json({
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: `${resource} API is not implemented yet`,
        details: {},
      },
    });
  });
}

export default router;
