import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    type: {
      type: String,
      enum: ["PROPERTY_VERIFICATION_FEE", "LEGAL_SERVICE", "TRANSACTION_FEE"],
    },
    amount: Number,
    currency: { type: String, default: "USD" },
    provider: String,
    providerPaymentId: String,
    status: {
      type: String,
      enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);
export default mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);
