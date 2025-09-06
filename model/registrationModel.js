// models/Registration.js
import mongoose from "mongoose";
import generateRegistrationId from "../middlewares/generateRegistrationId.js";

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    designation: { type: String, required: true },
    workplace: { type: String, required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
    transactionId: {
      type: String,
    },
    senderNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ["applied", "payment-submitted", "confirmed", "rejected"],
      default: "applied",
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

// Middleware: auto-generate registrationId
registrationSchema.pre("save", function (next) {
  if (this.isNew && !this.registrationId) {
    this.registrationId = generateRegistrationId();
  }
  next();
});

export default mongoose.model("Registration", registrationSchema);
