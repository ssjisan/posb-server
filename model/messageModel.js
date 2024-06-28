import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false, // Messages are unread by default
    },
  },
  { timestamps: true }
);

export default mongoose.model("Messages", messageSchema);
