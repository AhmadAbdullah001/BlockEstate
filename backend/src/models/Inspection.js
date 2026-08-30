import mongoose from "mongoose";
const inspectionSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scheduledAt: Date,
    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ],
      default: "ASSIGNED",
    },
    checklist: [{ label: String, passed: Boolean, notes: String }],
    notes: String,
    photos: [String],
    report: String,
    completedAt: Date,
  },
  { timestamps: true },
);
export default mongoose.models.Inspection ||
  mongoose.model("Inspection", inspectionSchema);
