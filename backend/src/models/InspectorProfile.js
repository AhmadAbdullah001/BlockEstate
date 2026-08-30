import mongoose from "mongoose";
const inspectorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    professionalName: String,
    licenseInformation: String,
    jurisdictions: [String],
    specializations: [String],
    experience: Number,
    bio: String,
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);
export default mongoose.models.InspectorProfile ||
  mongoose.model("InspectorProfile", inspectorProfileSchema);
