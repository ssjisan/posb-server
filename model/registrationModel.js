// models/Registration.js
import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);
