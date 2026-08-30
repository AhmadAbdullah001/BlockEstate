import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    passwordHash: { type: String, default: null },
    roles: {
      type: [String],
      enum: ["USER", "AGENT", "LAWYER", "INSPECTOR", "ADMIN"],
      default: ["USER"],
    },
    avatar: String,
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: { type: [Number] },
    },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    locationUpdatedAt: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    identityVerificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    accountStatus: {
      type: String,
      enum: ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },
    googleId: { type: String, unique: true, sparse: true },
    emailVerificationOTPHash: String,
    emailVerificationOTPExpiresAt: Date,
    emailVerificationAttempts: { type: Number, default: 0 },
    emailVerificationLastSentAt: Date,
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", function (next) {
  const latitude = Number(this.latitude);
  const longitude = Number(this.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    this.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    return next();
  }

  this.location = undefined;
  next();
});

userSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  const update = this.getUpdate ? this.getUpdate() : {};
  const source = update.$set || update;

  if (source && Number.isFinite(Number(source.latitude)) && Number.isFinite(Number(source.longitude))) {
    const geo = {
      type: "Point",
      coordinates: [Number(source.longitude), Number(source.latitude)],
    };

    if (update.$set) {
      update.$set.location = geo;
    } else {
      update.location = geo;
    }
    return next();
  }

  if (update.$set) {
    update.$set.location = undefined;
  } else {
    update.location = undefined;
  }

  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
