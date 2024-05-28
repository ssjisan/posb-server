import mongoose from "mongoose";

const eventModel = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 160,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    location: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    eventDate: {
      type: Date,
      trim: true,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Events", eventModel);
