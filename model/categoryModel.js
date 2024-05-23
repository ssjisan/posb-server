import mongoose, { Schema } from "mongoose";

const categorySchema = Schema({
  name: {
    type: String,
    max: 32,
    trim: true,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
});

export default mongoose.model("Category", categorySchema);
