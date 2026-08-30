import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile" },
    rating: { type: Number, min: 1, max: 5 },
    content: String,
  },
  { timestamps: true },
);
export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
