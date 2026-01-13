
import mongoose from "mongoose";

const jobSeekSchema = new mongoose.Schema({
  fullname: { type: String, required: true },

  username: { type: String, required: true, unique: true, trim: true },

  email: { type: String, required: true, unique: true, lowercase: true },

  phonenumber: { type: String, required: true },

  password: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("User", jobSeekSchema);


