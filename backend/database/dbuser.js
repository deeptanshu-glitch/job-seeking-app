
import mongoose from "mongoose";

const jobSeekSchema = new mongoose.Schema({

  fullname: { type: String, required: true },

  username: { type: String, required: true, unique: true, trim: true },

  email: { type: String, required: true, unique: true, lowercase: true },

  phonenumber: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: { type: String, enum: ["job seeker", "recruiter"], default: "job seeker", required: true },

  image: { type: String, default: null },

  resume: { type: [String], default: [] },

  resumeText: { type: String, default: "" },

  education: { type: String, default: "" },

  experience: { type: String, default: "" },

  skills: { type: String, default: "" },

  links: { type: String, default: "" },

  companyName: { type: String, default: "" },

  companyWebsite: { type: String, default: "" },

  companyDescription: { type: String, default: "" },

  location: { type: String, default: "" },

  position: { type: String, default: "" },

  resetOtp: { type: String, default: null },

  resetOtpExpires: { type: Date, default: null },

}, { timestamps: true });

const User = mongoose.model("User", jobSeekSchema);

export default User