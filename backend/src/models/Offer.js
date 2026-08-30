import mongoose from "mongoose";
const offerSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: Number,
    currency: { type: String, default: "USD" },
    message: String,
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "COUNTERED",
        "WITHDRAWN",
        "EXPIRED",
      ],
      default: "PENDING",
    },
    expiresAt: Date,
  },
  { timestamps: true },
);
export default mongoose.models.Offer || mongoose.model("Offer", offerSchema);
