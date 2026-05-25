import express from "express";
import Job from "../database/db.recruiter.js";
import Application from "../database/db.application.js"; 
import auth, { requireRole } from "../middleware.js";
import { isValidObjectId } from "../utils/validation.js";

const router = express.Router();


router.post("/apply/:jobId", auth, requireRole("job seeker"), async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id || req.user._id;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const jobRecord = await Job.findById(jobId);
    if (!jobRecord || jobRecord.status !== "active") {
      return res.status(404).json({ error: "Job not found or not open for applications" });
    }

    if (jobRecord.created_by?.toString() === userId.toString()) {
      return res.status(400).json({ error: "Recruiters cannot apply to their own jobs" });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({ job: jobId, applicant: userId });
    if (existing) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    const newApplication = await Application.create({
      applicant: userId,
      job: jobId,
      status: "pending"
    });

    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: newApplication._id }
    });

    return res.status(201).json({ message: "Applied successfully", application: newApplication });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
});


router.put("/application/:appId/:action", auth, requireRole("recruiter"), async (req, res) => {
  try {
    const { appId, action } = req.params;
    if (!isValidObjectId(appId)) {
      return res.status(400).json({ error: "Invalid application ID" });
    }

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const application = await Application.findById(appId).populate("job");
    if (!application || !application.job) {
      return res.status(404).json({ error: "Application not found" });
    }

    const recruiterId = req.user.id || req.user._id;
    if (application.job.created_by?.toString() !== recruiterId.toString()) {
      return res.status(403).json({ error: "Unauthorized to modify this application" });
    }

    application.status = action === "accept" ? "accepted" : "rejected";
    await application.save();
    await application.populate("applicant");

    return res.status(200).json({ message: `Application ${action}ed`, application });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
