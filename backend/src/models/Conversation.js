import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true },
);
export default mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
