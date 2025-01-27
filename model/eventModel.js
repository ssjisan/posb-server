import mongoose from "mongoose";

const eventModel = new mongoose.Schema(
  {
    coverPhoto: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    name: {
      type: String,
      trim: true,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      required: true,
    },
    details: {
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
    sequence: {
      type: Number,
      default: 0,
    },
    registrationLink: {
      type: String,
      trim: true,
    },
    registrationStartDate: {
      type: Date,
      trim: true,
    },
    registrationEndDate: {
      type: Date,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Events", eventModel);
