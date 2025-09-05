import mongoose from "mongoose";

const eventModel = new mongoose.Schema(
  {
    coverPhoto: {
      url: { type: String },
      public_id: { type: String },
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
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

    // ✅ Registration fields
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationStartDate: {
      type: Date,
      trim: true,
    },
    registrationEndDate: {
      type: Date,
      trim: true,
    },
    registrationFees: {
      type: Number,
      default: 0,
    },

    // ✅ Payment fields
    paymentStartDate: {
      type: Date,
      trim: true,
    },
    paymentEndDate: {
      type: Date,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Events", eventModel);
