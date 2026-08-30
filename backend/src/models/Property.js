import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    propertyType: String,
    price: { type: Number, min: 0 },
    currency: { type: String, default: "USD" },
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: { type: String, trim: true, default: "" },
    postalCode: String,
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: undefined },
    },
    geocodedAt: { type: Date, default: null },
    area: Number,
    bedrooms: Number,
    bathrooms: Number,
    parking: Number,
    floors: Number,
    kitchenCount: Number,
    livingRooms: Number,
    diningRooms: Number,
    balconies: Number,
    builtUpArea: Number,
    plotSize: Number,
    frontage: Number,
    zoning: String,
    businessType: String,
    furnishing: String,
    amenities: [String],
    images: [String],
    videos: [String],
    verificationStatus: {
      type: String,
      enum: [
        "DRAFT",
        "PAYMENT_PENDING",
        "SUBMITTED",
        "VERIFICATION_PENDING",
        "INSPECTION_SCHEDULED",
        "UNDER_REVIEW",
        "ACTION_REQUIRED",
        "VERIFIED",
        "REJECTED",
      ],
      default: "DRAFT",
    },
    listingStatus: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_VERIFICATION",
        "ACTIVE",
        "PAUSED",
        "SOLD",
        "REJECTED",
      ],
      default: "DRAFT",
    },
    publishedAt: Date,
  },
  { timestamps: true },
);

propertySchema.index({ location: "2dsphere" });

propertySchema.pre("save", function (next) {
  const lat = Number(this.latitude);
  const lng = Number(this.longitude);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    this.location = {
      type: "Point",
      coordinates: [lng, lat],
    };
  }

  next();
});

propertySchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
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
  }

  next();
});

export default mongoose.models.Property ||
  mongoose.model("Property", propertySchema);
