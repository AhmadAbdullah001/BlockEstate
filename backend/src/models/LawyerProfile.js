import mongoose from "mongoose";
const lawyerProfileSchema = new mongoose.Schema(
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
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    availability: String,
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    serviceFees: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);
export default mongoose.models.LawyerProfile ||
  mongoose.model("LawyerProfile", lawyerProfileSchema);
