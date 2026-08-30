import mongoose from "mongoose";
import AgentProfile from "../models/AgentProfile.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import Verification from "../models/Verification.js";
import PropertyDocument from "../models/PropertyDocument.js";
import { uploadMediaFile } from "../integrations/storage/cloudinary.js";
import { hashPassword } from "../utils/auth.js";

const normalizeBoolean = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const toText = (value) => String(value ?? "").trim();
const normalizeEmail = (value) => toText(value).toLowerCase();
const isRemoteUrl = (value) => typeof value === "string" && /^(https?:\/\/|data:)/i.test(value.trim());
const toFileName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value.originalname) return toText(value.originalname);
  return toText(value);
};
const normalizeDocumentEntry = async (document, folder) => {
  if (!document) return null;

  if (typeof document === "string") {
    const trimmedValue = document.trim();
    if (!trimmedValue) return null;
    if (isRemoteUrl(trimmedValue)) {
      return {
        name: trimmedValue.split("/").pop() || "Document",
        url: trimmedValue,
      };
    }
    return {
      name: trimmedValue,
      url: "",
    };
  }

  if (typeof document === "object" && document.url && document.name) {
    return {
      name: toText(document.name),
      url: toText(document.url),
    };
  }

  if (typeof document === "object" && document.buffer && document.originalname) {
    try {
      const uploadedUrl = await uploadMediaFile(document, folder);
      return {
        name: toText(document.originalname),
        url: uploadedUrl,
      };
    } catch {
      return {
        name: toText(document.originalname),
        url: "",
      };
    }
  }

  const fallbackName = toFileName(document);
  return {
    name: fallbackName || "Document",
    url: typeof document === "object" && document.url ? toText(document.url) : "",
  };
};

export const buildAgentApplicationPayload = (input = {}) => {
  const specializations = Array.isArray(input.specializations)
    ? input.specializations
    : toText(input.specializations)
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

  const serviceAreas = Array.isArray(input.serviceAreas)
    ? input.serviceAreas
    : toText(input.serviceAreas)
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

  const documentList = Array.isArray(input.documents) ? input.documents : [];

  return {
    fullName: toText(input.fullName),
    email: normalizeEmail(input.email),
    phone: toText(input.phone),
    password: toText(input.password),
    dateOfBirth: toText(input.dateOfBirth),
    country: toText(input.country),
    state: toText(input.state),
    city: toText(input.city),
    postalCode: toText(input.postalCode),
    agencyName: toText(input.agencyName),
    licenseNumber: toText(input.licenseNumber),
    yearsExperience: Number(input.yearsExperience) || 0,
    currentProfession: toText(input.currentProfession),
    professionalExperience: toText(input.professionalExperience),
    qualifications: toText(input.qualifications),
    specializations,
    serviceAreas,
    bio: toText(input.bio),
    profileImage: toFileName(input.profileImage),
    documents: documentList.map((document) => toFileName(document)).filter(Boolean),
  };
};

export async function applyForAgentRole(input = {}) {
  const payload = buildAgentApplicationPayload(input);

  if (!payload.fullName) throw Object.assign(new Error("Full name is required."), { statusCode: 400, code: "INVALID_AGENT_APPLICATION" });
  if (!payload.email) throw Object.assign(new Error("Email is required."), { statusCode: 400, code: "INVALID_AGENT_APPLICATION" });
  if (!payload.password) throw Object.assign(new Error("Password is required."), { statusCode: 400, code: "INVALID_AGENT_APPLICATION" });

  const profileImageUrl = await (async () => {
    const value = input.profileImage;
    if (!value) return "";
    if (typeof value === "string" && isRemoteUrl(value)) return value.trim();
    if (typeof value === "object" && value.buffer && value.originalname) {
      try {
        return await uploadMediaFile(value, "blockestate/agents/profile-images");
      } catch {
        return toFileName(value);
      }
    }
    return toFileName(value);
  })();
  const documentEntries = await Promise.all((Array.isArray(input.documents) ? input.documents : []).map((document) => normalizeDocumentEntry(document, "blockestate/agents/documents")));

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      passwordHash: await hashPassword(payload.password),
      roles: ["USER"],
      emailVerified: true,
      accountStatus: "ACTIVE",
      authProvider: "local",
    });
  } else {
    if (user.roles.includes("AGENT")) {
      throw Object.assign(new Error("This agent is already approved and active."), { statusCode: 409, code: "AGENT_ALREADY_APPROVED" });
    }
    user.name = user.name || payload.fullName;
    user.phone = user.phone || payload.phone;
    if (payload.password) user.passwordHash = await hashPassword(payload.password);
    user.emailVerified = true;
    user.accountStatus = "ACTIVE";
    await user.save();
  }

  const profile = await AgentProfile.findOne({ user: user._id });
  const nextProfile = {
    user: user._id,
    fullName: payload.fullName,
    agencyName: payload.agencyName,
    licenseNumber: payload.licenseNumber,
    yearsExperience: payload.yearsExperience,
    phone: payload.phone,
    passwordHash: user.passwordHash || (payload.password ? await hashPassword(payload.password) : ""),
    email: payload.email,
    specializations: payload.specializations,
    serviceAreas: payload.serviceAreas,
    bio: payload.professionalExperience || payload.bio,
    profileImage: isRemoteUrl(profileImageUrl) ? profileImageUrl : toFileName(profileImageUrl),
    documents: documentEntries.filter(Boolean).map((document) => ({
      name: document.name || "Document",
      url: document.url || "",
    })),
    dateOfBirth: payload.dateOfBirth,
    currentProfession: payload.currentProfession,
    professionalExperience: payload.professionalExperience,
    qualifications: payload.qualifications,
    postalCode: payload.postalCode,
    city: payload.city,
    state: payload.state,
    country: payload.country,
    verificationStatus: "PENDING",
    status: "ACTIVE",
    commissionRate: 0,
  };

  if (profile) {
    Object.assign(profile, nextProfile);
    await profile.save();
  } else {
    await AgentProfile.create(nextProfile);
  }

  return {
    message: "Agent application submitted successfully. It is now under admin review.",
    applicationStatus: "PENDING",
    user: { id: user._id.toString(), email: user.email, roles: user.roles },
  };
}

export async function listAgentApplications(filters = {}) {
  const query = {};
  if (filters.status) query.verificationStatus = filters.status;
  const search = String(filters.search || "").trim();
  if (search) {
    query.$or = [
      { fullName: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { city: new RegExp(search, "i") },
      { state: new RegExp(search, "i") },
    ];
  }
  return AgentProfile.find(query).populate("user", "name email phone avatar").sort({ createdAt: -1 }).lean();
}

export async function approveAgentApplication(agentId) {
  const profile = await AgentProfile.findById(agentId).populate("user");
  if (!profile) {
    throw Object.assign(new Error("Agent application not found."), { statusCode: 404, code: "AGENT_NOT_FOUND" });
  }

  profile.verificationStatus = "APPROVED";
  profile.status = "ACTIVE";
  await profile.save();

  const user = profile.user;
  if (user && !user.roles.includes("AGENT")) {
    user.roles = [...new Set([...(user.roles || []), "AGENT"])];
    user.accountStatus = "ACTIVE";
    await user.save();
  }

  return {
    message: "Agent application approved successfully.",
    profile,
    user,
  };
}

export async function rejectAgentApplication(agentId, reason = "") {
  const profile = await AgentProfile.findById(agentId).populate("user");
  if (!profile) {
    throw Object.assign(new Error("Agent application not found."), { statusCode: 404, code: "AGENT_NOT_FOUND" });
  }

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

  return {
    message: "Agent application rejected.",
    profile,
    user,
    reason,
  };
}

export async function listAgents(filters = {}) {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.city) query.city = new RegExp(String(filters.city), "i");
  if (filters.state) query.state = new RegExp(String(filters.state), "i");

  const featured = normalizeBoolean(filters.featured);
  if (featured !== undefined) query.isFeatured = featured;

  const search = String(filters.search || "").trim();
  if (search) {
    query.$or = [
      { fullName: new RegExp(search, "i") },
      { agencyName: new RegExp(search, "i") },
      { city: new RegExp(search, "i") },
      { state: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }

  const limit = Number(filters.limit || 0);
  const baseQuery = AgentProfile.find(query).populate("user", "name email phone avatar");

  const paginatedQuery = limit > 0 ? baseQuery.limit(limit) : baseQuery;

  const results = await paginatedQuery
    .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
    .lean();

  return results;
}

export async function getAgentById(agentId) {
  if (!agentId) return null;

  return AgentProfile.findById(agentId)
    .populate("user", "name email phone avatar")
    .lean();
}

export async function listFeaturedAgents(limit = 4) {
  return listAgents({ featured: true, limit });
}

export async function getAssignedProperties(userId) {
  if (!userId) {
    throw Object.assign(new Error("Agent user is required."), { statusCode: 400, code: "INVALID_AGENT_REQUEST" });
  }

  let profile = await AgentProfile.findOne({ user: userId }).lean();
  if (!profile) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw Object.assign(new Error("Agent profile not found."), { statusCode: 404, code: "AGENT_PROFILE_NOT_FOUND" });
    }

    profile = await AgentProfile.create({
      user: user._id,
      fullName: user.name || "Agent",
      email: user.email || "",
      phone: user.phone || "",
      passwordHash: user.passwordHash || "",
      verificationStatus: "APPROVED",
      status: "ACTIVE",
    });
  }

  const verifications = await Verification.find({ assignedAgent: profile._id })
    .populate({ path: "property", populate: { path: "seller", select: "name email phone avatar" } })
    .sort({ updatedAt: -1 })
    .lean();

  const properties = verifications
    .map((verification) => {
      const property = verification.property;
      if (!property) return null;

      const currentStatus = verification.overallStatus || "PENDING";
      const statusLabel = currentStatus === "PASSED" ? "Verified" : currentStatus === "FAILED" ? "Rejected" : currentStatus === "IN_PROGRESS" ? "In progress" : "Pending review";

      return {
        id: String(property._id),
        verificationId: String(verification._id),
        title: property.title || "Property verification",
        address: [property.address, property.city, property.state, property.country].filter(Boolean).join(", ") || "Location pending",
        price: property.price || 0,
        images: Array.isArray(property.images) ? property.images.filter(Boolean) : [],
        status: currentStatus,
        statusLabel,
        stage: verification.documentVerification?.status || verification.physicalInspection?.status || "PENDING",
        updatedAt: verification.updatedAt || verification.createdAt,
        createdAt: verification.createdAt,
        seller: property.seller?.name || "Owner",
        propertyType: property.propertyType || "Property",
      };
    })
    .filter(Boolean);

  const stats = {
    total: properties.length,
    inProgress: properties.filter((property) => property.status === "IN_PROGRESS").length,
    pending: properties.filter((property) => property.status === "PENDING").length,
    completed: properties.filter((property) => ["PASSED", "FAILED"].includes(property.status)).length,
  };

  return { stats, properties };
}

export async function getAgentDashboard(userId) {
  if (!userId) {
    throw Object.assign(new Error("Agent user is required."), { statusCode: 400, code: "INVALID_AGENT_REQUEST" });
  }

  let profile = await AgentProfile.findOne({ user: userId }).populate("user", "name email phone avatar").lean();
  if (!profile) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw Object.assign(new Error("Agent profile not found."), { statusCode: 404, code: "AGENT_PROFILE_NOT_FOUND" });
    }

    profile = await AgentProfile.create({
      user: user._id,
      fullName: user.name || "Agent",
      email: user.email || "",
      phone: user.phone || "",
      passwordHash: user.passwordHash || "",
      verificationStatus: "APPROVED",
      status: "ACTIVE",
    });
  }

  const assignments = await Verification.find({ assignedAgent: profile._id })
    .sort({ updatedAt: -1 })
    .limit(25)
    .lean();

  const normalizedAssignments = await Promise.all(
    assignments.map(async (verification) => {
      const propertyId = verification.property;
      const property = await Property.findById(propertyId).lean();
      const status = verification.overallStatus || "PENDING";
      return {
        id: String(verification._id),
        propertyId: property ? String(property._id) : null,
        title: property?.title || "Property verification",
        address: property ? [property.address, property.city, property.state].filter(Boolean).join(", ") : "Address pending",
        price: property?.price || 0,
        status,
        stage: verification.documentVerification?.status || verification.physicalInspection?.status || "PENDING",
        lastUpdated: verification.updatedAt || verification.createdAt,
        timeline: verification.timeline || [],
      };
    }),
  );

  const stats = {
    totalAssignments: normalizedAssignments.length,
    activeAssignments: normalizedAssignments.filter((assignment) => ["PENDING", "IN_PROGRESS"].includes(assignment.status)).length,
    completedAssignments: normalizedAssignments.filter((assignment) => ["PASSED", "FAILED"].includes(assignment.status)).length,
    dueSoon: normalizedAssignments.filter((assignment) => assignment.status === "IN_PROGRESS").length,
  };

  const recentActivity = normalizedAssignments
    .flatMap((assignment) => (assignment.timeline || []).map((item) => ({
      id: `${assignment.id}-${item.label}-${item.occurredAt || Date.now()}`,
      title: item.label || "Verification update",
      description: assignment.title,
      status: item.status || assignment.status,
      occurredAt: item.occurredAt || assignment.lastUpdated,
    })))
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
    .slice(0, 5);

  const notifications = normalizedAssignments.slice(0, 3).map((assignment, index) => ({
    id: `${assignment.id}-notification-${index}`,
    type: assignment.status === "PENDING" ? "assignment" : "review",
    title: assignment.status === "PENDING" ? "New assignment" : "Review update",
    message: `${assignment.title} needs ${assignment.status === "PENDING" ? "attention" : "follow-up"}.`,
    createdAt: assignment.lastUpdated,
  }));

  return {
    agent: profile,
    stats,
    assignments: normalizedAssignments,
    recentActivity,
    notifications,
  };
}

const verificationError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

const verificationStages = new Set([
  "documentVerification",
  "ownershipVerification",
  "physicalInspection",
  "legalVerification",
]);
const stageStatuses = new Set(["PENDING", "IN_PROGRESS", "PASSED", "FAILED"]);

async function getOwnedVerification(userId, verificationId) {
  if (!mongoose.isValidObjectId(verificationId)) {
    throw verificationError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found.");
  }
  const profile = await AgentProfile.findOne({ user: userId }).lean();
  if (!profile) {
    throw verificationError(404, "AGENT_PROFILE_NOT_FOUND", "Agent profile not found.");
  }
  const verification = await Verification.findOne({
    _id: verificationId,
    assignedAgent: profile._id,
  });
  if (!verification) {
    throw verificationError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found.");
  }
  return verification;
}

export async function getAgentAssignment(userId, verificationId) {
  await getOwnedVerification(userId, verificationId);
  const verification = await Verification.findById(verificationId)
    .populate({ path: "property", populate: { path: "seller", select: "name email phone avatar" } })
    .populate({ path: "assignedAgent", populate: { path: "user", select: "name email avatar" } })
    .lean();
  const documents = await PropertyDocument.find({ property: verification.property?._id })
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();
  return { verification, documents };
}

export async function updateAgentAssignment(userId, verificationId, input = {}) {
  const stage = String(input.stage || "");
  const status = String(input.status || "");
  const notes = String(input.notes || "").trim();
  const issue = String(input.issue || "").trim();

  if (!verificationStages.has(stage) || !stageStatuses.has(status)) {
    throw verificationError(400, "INVALID_VERIFICATION_UPDATE", "Choose a valid verification stage and status.");
  }

  const verification = await getOwnedVerification(userId, verificationId);
  const now = new Date();
  const currentStage = verification[stage] || {};
  verification[stage] = {
    status,
    startedAt: currentStage.startedAt || now,
    completedAt: ["PASSED", "FAILED"].includes(status) ? now : undefined,
    notes,
  };
  if (issue && !verification.issues.includes(issue)) verification.issues.push(issue);

  const stages = [...verificationStages].map((name) => verification[name]?.status || "PENDING");
  const hasFailure = stages.includes("FAILED");
  const isComplete = stages.every((value) => value === "PASSED");
  verification.overallStatus = hasFailure ? "FAILED" : isComplete ? "PASSED" : "IN_PROGRESS";
  verification.timeline.push({
    label: `${stage.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())}: ${status.replace("_", " ")}`,
    status: verification.overallStatus,
    occurredAt: now,
  });
  await verification.save();

  const property = await Property.findById(verification.property);
  if (property) {
    if (hasFailure) {
      property.verificationStatus = "ACTION_REQUIRED";
      property.listingStatus = "PENDING_VERIFICATION";
    } else if (isComplete) {
      property.verificationStatus = "VERIFIED";
      property.listingStatus = "ACTIVE";
      property.publishedAt = property.publishedAt || now;
    } else {
      property.verificationStatus = "UNDER_REVIEW";
      property.listingStatus = "PENDING_VERIFICATION";
    }
    await property.save();
  }
  return verification;
}

export async function addAgentEvidence(userId, verificationId, file, type = "AGENT_EVIDENCE") {
  if (!file) throw verificationError(400, "NO_FILE_UPLOADED", "Upload an evidence file.");
  const verification = await getOwnedVerification(userId, verificationId);
  const fileUrl = await uploadMediaFile(file, "blockestate/verifications/evidence");
  const document = await PropertyDocument.create({
    property: verification.property,
    uploadedBy: userId,
    type: String(type || "AGENT_EVIDENCE").trim().slice(0, 80),
    fileUrl,
    fileName: file.originalname,
  });
  verification.timeline.push({ label: `Evidence uploaded: ${file.originalname}`, status: verification.overallStatus, occurredAt: new Date() });
  await verification.save();
  return document;
}
