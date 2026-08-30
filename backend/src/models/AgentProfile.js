import mongoose from "mongoose";

const agentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    agencyName: {
      type: String,
      trim: true,
      default: "",
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: "",
    },
    yearsExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    passwordHash: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    specializations: [{
      type: String,
      trim: true,
    }],
    languages: [{
      type: String,
      trim: true,
    }],
    serviceAreas: [{
      type: String,
      trim: true,
    }],
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    documents: [{
      name: {
        type: String,
        trim: true,
        default: "",
      },
      url: {
        type: String,
        trim: true,
        default: "",
      },
    }],
    dateOfBirth: {
      type: String,
      trim: true,
      default: "",
    },
    currentProfession: {
      type: String,
      trim: true,
      default: "",
    },
    professionalExperience: {
      type: String,
      trim: true,
      default: "",
    },
    qualifications: {
      type: String,
      trim: true,
      default: "",
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    commissionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true },
);

agentProfileSchema.index({ location: "2dsphere" });

export default mongoose.models.AgentProfile ||
  mongoose.model("AgentProfile", agentProfileSchema);
