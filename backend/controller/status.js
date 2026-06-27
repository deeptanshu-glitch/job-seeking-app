import express from "express";
import Job from "../database/db.recruiter.js";
import Application from "../database/db.application.js";
import User from "../database/dbuser.js";
import auth, { requireRole } from "../middleware.js";
import { isValidObjectId } from "../utils/validation.js";
import sendSms from "../utils/sms.js";

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

    const application = await Application.findById(appId).populate("job").populate("applicant");
    if (!application || !application.job || !application.applicant) {
      return res.status(404).json({ error: "Application not found" });
    }

    const recruiterId = req.user.id || req.user._id;
    if (application.job.created_by?.toString() !== recruiterId.toString()) {
      return res.status(403).json({ error: "Unauthorized to modify this application" });
    }

    application.status = action === "accept" ? "accepted" : "rejected";
    await application.save();

    const notificationMessage = action === "accept"
      ? `Your application for "${application.job.title}" at ${application.job.companyName} has been accepted. A recruiter will contact you soon with next steps.`
      : `Your application for "${application.job.title}" at ${application.job.companyName} was not selected. Keep applying — new opportunities are waiting.`;

    await User.findByIdAndUpdate(application.applicant._id, {
      $push: {
        notifications: {
          message: notificationMessage,
          type: action === "accept" ? "success" : "warning",
          read: false,
          createdAt: new Date()
        }
      }
    });

    if (action === "accept" && application.applicant?.phonenumber) {
      await sendSms(
        application.applicant.phonenumber,
        `Good news! Your application for "${application.job.title}" at ${application.job.companyName} has been accepted. Please check your dashboard for next steps.`
      );
    }

    return res.status(200).json({ message: `Application ${action}ed`, application });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
