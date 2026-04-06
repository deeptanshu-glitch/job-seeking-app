
import mongoose from "mongoose";

const jobSeekSchema = new mongoose.Schema({
  
  fullname: { type: String, required: true },

  username: { type: String, required: true, unique: true, trim: true },

  email: { type: String, required: true, unique: true, lowercase: true },

  phonenumber: { type: String, required: true },

  password: { type: String, required: true },

  role: { type: String, enum: ["job seeker", "recruiter"], default: "job seeker", required: true },

  image: { type: String, default: null },

  resume: { type: [String], default: [] },      

  resumeText: { type: String, default: "" },

  education: { type: String, default: "" },

  experience: { type: String, default: "" },

  skills: { type: String, default: "" },

  links: { type: String, default: "" },

  company: {type: mongoose.Schema.Types.ObjectId, ref: "Company"}

}, { timestamps: true });

const User = mongoose.model("User", jobSeekSchema);

export default User