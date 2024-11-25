import mongoose from "mongoose";

const linkModal = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 160,
    },
    publishedDate: {
      type: Date,
      trim: true,
      required: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Links", linkModal);
