import mongoose from "mongoose";

const eventModel = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
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
    registrationLink: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
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
    linkExpireDate: {
      type: Date,
      trim: true,
    },
    eventExpired: {
      // New field to store expiration status
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Events", eventModel);
