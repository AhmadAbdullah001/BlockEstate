import { Router } from "express";
import { addAgentEvidence, applyAgent, getAgent, getAgentAssignment, getAgentDashboard, listAgentApplications, listAgentProperties, listAgents, updateAgentAssignment } from "../controllers/agent.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.post(
  "/apply",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "documents", maxCount: 10 },
  ]),
  applyAgent,
);
router.get("/dashboard", authenticate, authorize("AGENT"), getAgentDashboard);
router.get("/properties", authenticate, authorize("AGENT"), listAgentProperties);
router.get("/assignments/:verificationId", authenticate, authorize("AGENT"), getAgentAssignment);
router.patch("/assignments/:verificationId", authenticate, authorize("AGENT"), updateAgentAssignment);
router.post("/assignments/:verificationId/evidence", authenticate, authorize("AGENT"), upload.single("file"), addAgentEvidence);
router.get("/", listAgents);
router.get("/applications", authenticate, authorize("ADMIN"), listAgentApplications);
router.get("/:agentId", getAgent);

export default router;
