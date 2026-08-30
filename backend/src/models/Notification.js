import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: String,
    title: String,
    message: String,
    readAt: Date,
    data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);
export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
