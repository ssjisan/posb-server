import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
    registrationInfo: [
      {
        registrationId: {
          type: String,
          required: true,
        },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        designation: { type: String, required: true },
        workplace: { type: String, required: true },
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
    ],
  },
  { timestamps: true }
);
registrationSchema.index(
  { "registrationInfo.registrationId": 1 },
  { unique: true, sparse: true }
);
export default mongoose.model("Registration", registrationSchema);
