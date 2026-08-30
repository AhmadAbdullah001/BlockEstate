import mongoose from "mongoose";

const stageSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "PASSED", "FAILED", "NOT_APPLICABLE"],
      default: "PENDING",
    },
    startedAt: Date,
    completedAt: Date,
    notes: String,
  },
  { _id: false },
);
const verificationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentProfile",
      default: null,
    },
    inspectorAssignment: stageSchema,
    physicalInspection: stageSchema,
    documentVerification: stageSchema,
    ownershipVerification: stageSchema,
    legalVerification: stageSchema,
    overallStatus: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "PASSED", "FAILED"],
      default: "PENDING",
    },
    issues: [String],
    notes: String,
    timeline: [{ label: String, status: String, occurredAt: Date }],
  },
  { timestamps: true },
);
export default mongoose.models.Verification ||
  mongoose.model("Verification", verificationSchema);
