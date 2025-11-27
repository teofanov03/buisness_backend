import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, default: "N/A" },  // ← OBAVEZNO DODATO
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
