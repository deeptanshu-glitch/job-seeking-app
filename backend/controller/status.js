import express from "express";
import Job from "../database/db.recruiter.js";
import Application from "../database/db.application.js"; 
import auth from "../middleware.js";

const router = express.Router();


router.post("/apply/:jobId", auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id || req.user._id;

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


router.put("/application/:appId/:action", auth, async (req, res) => {
  try {
    const { appId, action } = req.params;
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const updatedApp = await Application.findByIdAndUpdate(
      appId,
      { status: action === "accept" ? "accepted" : "rejected" },
      { new: true }
    ).populate("applicant");

    if (!updatedApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    return res.status(200).json({ message: `Application ${action}ed`, application: updatedApp });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
