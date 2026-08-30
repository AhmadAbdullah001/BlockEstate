import * as agentService from "../services/agent.service.js";

export async function applyAgent(req, res) {
  const payload = { ...(req.body || {}) };

  if (req.files?.profileImage?.[0]) {
    payload.profileImage = req.files.profileImage[0];
  }

  if (req.files?.documents?.length) {
    payload.documents = req.files.documents;
  }

  const result = await agentService.applyForAgentRole(payload);

  return res.status(201).json({
    success: true,
    message: result.message,
    data: {
      applicationStatus: result.applicationStatus,
      user: result.user,
    },
  });
}

export async function listAgents(req, res) {
  const agents = await agentService.listAgents(req.query || {});

  return res.json({
    success: true,
    data: { agents },
  });
}

export async function getAgent(req, res) {
  const agent = await agentService.getAgentById(req.params.agentId);

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: { code: "AGENT_NOT_FOUND", message: "Agent not found." },
    });
  }

  return res.json({
    success: true,
    data: { agent },
  });
}

export async function listAgentApplications(req, res) {
  const applications = await agentService.listAgentApplications(req.query || {});

  return res.json({
    success: true,
    data: { applications },
  });
}

export async function listAgentProperties(req, res) {
  const data = await agentService.getAssignedProperties(req.user.sub);

  return res.json({
    success: true,
    data,
  });
}

export async function getAgentDashboard(req, res) {
  const dashboard = await agentService.getAgentDashboard(req.user.sub);

  return res.json({
    success: true,
    data: dashboard,
  });
}

export async function getAgentAssignment(req, res) {
  const data = await agentService.getAgentAssignment(
    req.user.sub,
    req.params.verificationId,
  );
  return res.json({ success: true, data });
}

export async function updateAgentAssignment(req, res) {
  const verification = await agentService.updateAgentAssignment(
    req.user.sub,
    req.params.verificationId,
    req.body || {},
  );
  return res.json({
    success: true,
    message: "Verification stage updated.",
    data: { verification },
  });
}

export async function addAgentEvidence(req, res) {
  const document = await agentService.addAgentEvidence(
    req.user.sub,
    req.params.verificationId,
    req.file,
    req.body?.type,
  );
  return res.status(201).json({
    success: true,
    message: "Evidence uploaded.",
    data: { document },
  });
}
