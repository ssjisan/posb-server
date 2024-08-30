import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  phoneNumber: {
    type: Number,
    required: true,
  },
  whatsapp: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("ContactInfo", contactSchema);
