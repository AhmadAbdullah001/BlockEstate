import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
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
    agreedPrice: Number,
    currency: { type: String, default: "USD" },
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: [
        "OFFER_ACCEPTED",
        "TRANSACTION_CREATED",
        "LAWYER_REQUESTED",
        "LAWYER_ASSIGNED",
        "DOCUMENT_COLLECTION",
        "LEGAL_REVIEW",
        "AGREEMENT_PREPARATION",
        "SIGNING",
        "PAYMENT_PENDING",
        "CLOSING",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "OFFER_ACCEPTED",
    },
    milestones: [{ name: String, completed: Boolean, completedAt: Date }],
    completedAt: Date,
  },
  { timestamps: true },
);
export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
