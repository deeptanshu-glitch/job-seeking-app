
import mongoose from "mongoose";

const jobSeekSchema = new mongoose.Schema({
  fullname: { type: String, required: true },

  username: { type: String, required: true, unique: true, trim: true },

  email: { type: String, required: true, unique: true, lowercase: true },

  phonenumber: { type: String, required: true },

  password: { type: String, required: true },

  image: { type: String, default: null },

  education: { type: String, default: "" },

  experience: { type: String, default: "" }
  
}, { timestamps: true });

export default mongoose.model("User", jobSeekSchema);


