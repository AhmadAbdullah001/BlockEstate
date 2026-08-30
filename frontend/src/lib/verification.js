import { FileText, Gavel, House, UserRound } from "lucide-react";

// Shared by the seller and agent portals so each person sees the same workflow.
export const verificationStages = [
  {
    key: "inspectorAssignment",
    title: "Inspector assigned",
    description: "An approved inspector has been assigned to this property.",
    icon: UserRound,
    agentEditable: false,
  },
  {
    key: "documentVerification",
    title: "Document verification",
    description: "Review submitted evidence and property records.",
    icon: FileText,
  },
  {
    key: "ownershipVerification",
    title: "Ownership verification",
    description: "Confirm the seller and title records are consistent.",
    icon: UserRound,
  },
  {
    key: "physicalInspection",
    title: "Physical inspection",
    description: "Record the on-site inspection result and observations.",
    icon: House,
  },
  {
    key: "legalVerification",
    title: "Legal & zoning",
    description: "Complete the legal and zoning review.",
    icon: Gavel,
  },
];

export const readableVerificationStatus = (status = "PENDING") =>
  status.replaceAll("_", " ");

export const getVerificationStage = (verification, key) => {
  if (key === "inspectorAssignment" && !verification?.[key]) {
    return verification?.assignedAgent
      ? { status: "PASSED", notes: `Inspector assigned: ${verification.assignedAgent.fullName || "Assigned inspector"}` }
      : { status: "PENDING" };
  }
  return verification?.[key] || { status: "PENDING" };
};
