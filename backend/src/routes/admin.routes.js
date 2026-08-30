import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { approveAgentApplication, assignAdminAgent, getAdminOverview, getAdminProperties, getAdminProperty, listAdminAgents, listAdminVerifications, listPendingAgentApplications, rejectAgentApplication, updateAdminVerification } from "../controllers/admin.controller.js";

const router = Router();
router.get("/overview", authenticate, authorize("ADMIN"), getAdminOverview);
router.get("/properties", authenticate, authorize("ADMIN"), getAdminProperties);
router.get("/properties/:propertyId", authenticate, authorize("ADMIN"), getAdminProperty);
router.get("/verifications", authenticate, authorize("ADMIN"), listAdminVerifications);
router.patch("/properties/:propertyId/verification", authenticate, authorize("ADMIN"), updateAdminVerification);
router.get("/agents", authenticate, authorize("ADMIN"), listAdminAgents);
router.get("/agents/applications", authenticate, authorize("ADMIN"), listPendingAgentApplications);
router.post("/agents/:agentId/approve", authenticate, authorize("ADMIN"), approveAgentApplication);
router.post("/agents/:agentId/reject", authenticate, authorize("ADMIN"), rejectAgentApplication);
router.post("/properties/:propertyId/assign-agent", authenticate, authorize("ADMIN"), assignAdminAgent);

export default router;
