import mongoose from "mongoose";
import AgentProfile from "../models/AgentProfile.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import Verification from "../models/Verification.js";
import { sendAgentApprovalEmail } from "../integrations/email/email.service.js";

const ACTIVE_VERIFICATION_STATUSES = ["SUBMITTED", "VERIFICATION_PENDING", "INSPECTION_SCHEDULED", "UNDER_REVIEW", "ACTION_REQUIRED"];
const STATUS_LABELS = { ACTIVE: "Active", DRAFT: "Draft", PAYMENT_PENDING: "Payment pending", SUBMITTED: "Submitted", VERIFICATION_PENDING: "Pending verification", INSPECTION_SCHEDULED: "Inspection scheduled", UNDER_REVIEW: "Under review", ACTION_REQUIRED: "Action required", VERIFIED: "Verified", REJECTED: "Rejected", PENDING_VERIFICATION: "Pending verification" };
const isId = (value) => mongoose.isValidObjectId(value);
const fail = (statusCode, code, message) => Object.assign(new Error(message), { statusCode, code });
const statusLabel = (status) => STATUS_LABELS[status] || "Unknown";
const propertyFilter = (query = {}) => {
  const filter = {};
  if (query.status) filter.verificationStatus = query.status;
  const search = String(query.search || "").trim();
  if (search) filter.$or = ["title", "city", "state", "address"].map((field) => ({ [field]: new RegExp(search, "i") }));
  return filter;
};
const propertyView = (property) => ({ ...property, currentStatus: property.verificationStatus || property.listingStatus || "DRAFT", statusLabel: statusLabel(property.verificationStatus || property.listingStatus || "DRAFT"), sellerName: property.seller?.name || "Unknown seller", locationText: [property.city, property.state, property.country].filter(Boolean).join(", ") || "Location pending" });

export async function getAdminOverview(_req, res) {
  const pendingFilter = { verificationStatus: { $in: ACTIVE_VERIFICATION_STATUSES } };
  const [
    totalProperties,
    verifiedProperties,
    pendingVerification,
    flaggedProperties,
    totalUsers,
    activeUsers,
    totalAdmins,
    submittedCount,
    assignedCount,
    inProgressCount,
    awaitingCompletionCount,
  ] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ verificationStatus: "VERIFIED" }),
    Property.countDocuments(pendingFilter),
    Property.countDocuments({ verificationStatus: "ACTION_REQUIRED" }),
    User.countDocuments(),
    User.countDocuments({ accountStatus: "ACTIVE" }),
    User.countDocuments({ roles: "ADMIN" }),
    Property.countDocuments({ verificationStatus: { $in: ["SUBMITTED", "VERIFICATION_PENDING"] } }),
    Verification.countDocuments({ assignedAgent: { $ne: null } }),
    Verification.countDocuments({ assignedAgent: { $ne: null }, overallStatus: "IN_PROGRESS" }),
    Verification.countDocuments({ assignedAgent: { $ne: null }, overallStatus: "PENDING" }),
  ]);

  const verificationQueue = inProgressCount + awaitingCompletionCount;

  res.json({
    success: true,
    data: {
      stats: {
        totalProperties,
        verifiedProperties,
        pendingVerification,
        flaggedProperties,
        totalUsers,
        activeUsers,
        totalAdmins,
        submitted: submittedCount,
        agentAssigned: assignedCount,
        inProgress: inProgressCount,
        awaitingCompletion: awaitingCompletionCount,
        verificationQueue,
      },
      summary: {
        activeListings: await Property.countDocuments({ listingStatus: "ACTIVE" }),
        totalDrafts: await Property.countDocuments({ listingStatus: "DRAFT" }),
      },
    },
  });
}

export async function getAdminProperties(req, res) {
  const properties = await Property.find(propertyFilter(req.query)).populate("seller", "name email avatar").sort({ updatedAt: -1, createdAt: -1 }).lean();
  res.json({ success: true, data: { properties: properties.map(propertyView) } });
}

getAdminProperties.statusLabel = statusLabel;

export async function getAdminProperty(req, res) {
  if (!isId(req.params.propertyId)) throw fail(404, "PROPERTY_NOT_FOUND", "Property not found.");
  const property = await Property.findById(req.params.propertyId).populate("seller", "name email avatar").lean();
  if (!property) throw fail(404, "PROPERTY_NOT_FOUND", "Property not found.");
  const verification = await Verification.findOne({ property: property._id }).populate({ path: "assignedAgent", populate: { path: "user", select: "name email avatar" } }).lean();
  res.json({ success: true, data: { property: propertyView(property), verification } });
}

export async function listAdminVerifications(req, res) {
  const filter = { verificationStatus: { $in: ACTIVE_VERIFICATION_STATUSES } };
  if (req.query.status) filter.verificationStatus = req.query.status;
  const properties = await Property.find(filter).populate("seller", "name email").sort({ updatedAt: -1 }).lean();
  const verificationRows = await Verification.find({ property: { $in: properties.map((p) => p._id) } }).populate({ path: "assignedAgent", populate: { path: "user", select: "name email avatar" } }).lean();
  const byProperty = new Map(verificationRows.map((verification) => [String(verification.property), verification]));
  res.json({ success: true, data: { verifications: properties.map((property) => ({ property: propertyView(property), verification: byProperty.get(String(property._id)) || null })) } });
}

export async function updateAdminVerification(req, res) {
  const { status, notes } = req.body || {};
  if (!STATUS_LABELS[status]) throw fail(400, "INVALID_VERIFICATION_STATUS", "A valid verification status is required.");
  if (!isId(req.params.propertyId)) throw fail(404, "PROPERTY_NOT_FOUND", "Property not found.");
  const property = await Property.findById(req.params.propertyId);
  if (!property) throw fail(404, "PROPERTY_NOT_FOUND", "Property not found.");
  property.verificationStatus = status;
  property.listingStatus = status === "VERIFIED" ? "ACTIVE" : status === "REJECTED" ? "REJECTED" : "PENDING_VERIFICATION";
  if (status === "VERIFIED") property.publishedAt = new Date();
  await property.save();
  const overallStatus = status === "VERIFIED" ? "PASSED" : status === "REJECTED" ? "FAILED" : "IN_PROGRESS";
  const verification = await Verification.findOneAndUpdate({ property: property._id }, { $set: { overallStatus, ...(notes ? { notes } : {}) }, $push: { timeline: { label: STATUS_LABELS[status], status: overallStatus, occurredAt: new Date() } } }, { new: true, upsert: true });
  res.json({ success: true, message: "Verification status updated.", data: { property, verification } });
}

export async function listAdminAgents(_req, res) {
  const agents = await AgentProfile.find({ status: "ACTIVE", verificationStatus: "APPROVED" }).populate("user", "name email avatar").sort({ fullName: 1 }).lean();
  const workload = await Verification.aggregate([{ $match: { assignedAgent: { $in: agents.map((agent) => agent._id) }, overallStatus: { $in: ["PENDING", "IN_PROGRESS"] } } }, { $group: { _id: "$assignedAgent", activeAssignments: { $sum: 1 } } }]);
  const countByAgent = new Map(workload.map((row) => [String(row._id), row.activeAssignments]));
  const result = agents.map((agent) => ({ ...agent, activeAssignments: countByAgent.get(String(agent._id)) || 0, capacity: 5 }));
  res.json({ success: true, data: { agents: result, stats: { totalAgents: result.length, activeVerifications: result.reduce((sum, agent) => sum + agent.activeAssignments, 0), overCapacity: result.filter((agent) => agent.activeAssignments >= agent.capacity).length } } });
}

export async function listPendingAgentApplications(_req, res) {
  const agents = await AgentProfile.find({ verificationStatus: { $in: ["PENDING", "REJECTED"] } }).populate("user", "name email avatar").sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { applications: agents } });
}

export async function approveAgentApplication(req, res) {
  const agentId = req.params.agentId;
  const profile = await AgentProfile.findById(agentId).populate("user");
  if (!profile) throw fail(404, "AGENT_NOT_FOUND", "Agent application not found.");

  profile.verificationStatus = "APPROVED";
  profile.status = "ACTIVE";
  await profile.save();

  const user = profile.user;
  if (user && !user.roles.includes("AGENT")) {
    user.roles = [...new Set([...(user.roles || []), "AGENT"])];
    user.accountStatus = "ACTIVE";
    await user.save();
  }

  if (user?.email) {
    await sendAgentApprovalEmail(user.email, user.name || profile.fullName);
  }

  res.json({ success: true, message: "Agent application approved successfully.", data: { agent: profile, user } });
}

export async function rejectAgentApplication(req, res) {
  const { reason } = req.body || {};
  const agentId = req.params.agentId;
  const profile = await AgentProfile.findById(agentId).populate("user");
  if (!profile) throw fail(404, "AGENT_NOT_FOUND", "Agent application not found.");

  profile.verificationStatus = "REJECTED";
  profile.status = "INACTIVE";
  if (reason) profile.bio = [profile.bio, reason].filter(Boolean).join(" | ");
  await profile.save();

  const user = profile.user;
  if (user && user.roles.includes("AGENT")) {
    user.roles = user.roles.filter((role) => role !== "AGENT");
    user.accountStatus = "PENDING_VERIFICATION";
    await user.save();
  }

  res.json({ success: true, message: "Agent application rejected.", data: { agent: profile, user, reason } });
}

export async function assignAdminAgent(req, res) {
  const { agentId } = req.body || {};
  if (!isId(req.params.propertyId) || !isId(agentId)) throw fail(400, "INVALID_ASSIGNMENT", "A valid property and agent are required.");

  const [property, agent] = await Promise.all([
    Property.findById(req.params.propertyId),
    AgentProfile.findOne({ _id: agentId, status: "ACTIVE", verificationStatus: "APPROVED" }),
  ]);

  if (!property) throw fail(404, "PROPERTY_NOT_FOUND", "Property not found.");
  if (!agent) throw fail(404, "AGENT_NOT_FOUND", "An approved active agent was not found.");

  const startedAt = new Date();
  const verification = await Verification.findOneAndUpdate(
    { property: property._id },
    {
      $set: {
        assignedAgent: agent._id,
        overallStatus: "IN_PROGRESS",
        inspectorAssignment: {
          status: "PASSED",
          startedAt,
          completedAt: startedAt,
          notes: `Inspector assigned: ${agent.fullName}`,
        },
        documentVerification: {
          status: "IN_PROGRESS",
          startedAt,
          completedAt: null,
          notes: "Document verification started",
        },
        physicalInspection: {
          status: "PENDING",
          startedAt: null,
          completedAt: null,
          notes: "Waiting for inspection scheduling",
        },
        ownershipVerification: {
          status: "PENDING",
          startedAt: null,
          completedAt: null,
          notes: "Waiting for ownership review",
        },
        legalVerification: {
          status: "PENDING",
          startedAt: null,
          completedAt: null,
          notes: "Waiting for legal review",
        },
      },
      $push: {
        timeline: { label: `Assigned to ${agent.fullName}`, status: "IN_PROGRESS", occurredAt: startedAt },
      },
    },
    { upsert: true, new: true },
  );

  const nextStatus = property.verificationStatus === "VERIFIED" ? "VERIFIED" : "UNDER_REVIEW";
  property.verificationStatus = nextStatus;
  property.listingStatus = nextStatus === "VERIFIED" ? "ACTIVE" : "PENDING_VERIFICATION";
  await property.save();

  const payload = { success: true, message: "Agent assigned.", data: { verification } };
  if (res && typeof res.json === "function") {
    return res.json(payload);
  }

  return payload;
}
