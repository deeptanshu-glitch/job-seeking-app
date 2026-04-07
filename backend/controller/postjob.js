import express from "express";
import job from "../database/db.recruiter.js";
import Application from "../database/db.application.js";
import User from "../database/dbuser.js";
import auth from "../middleware.js";

const router = express.Router();

// POST a new job
router.post("/postjob", auth, async (req, res) => {
    try {
        const { title, description, requirements, salary, experience, location, jobtype, position, companyName } = req.body;

        const userId = req.user._id || req.user.id;

        const reqList = Array.isArray(requirements)
            ? requirements
            : requirements
            ? requirements.split(",").map(r => r.trim()).filter(Boolean)
            : [];

        if (!title || !description || !location || !jobtype || !position || !companyName) {
            return res.status(400).json({ error: "All required fields must be filled", status: false });
        }

        const newJob = await job.create({
            title,
            description,
            requirements: reqList,
            salary: salary || "Not specified",
            experience: experience || "",
            location,
            jobtype,
            position,
            companyName,
            created_by: userId,
            status: 'active'
        });
        return res.status(201).json({ message: "Job created successfully", job: newJob, success: true });
    } catch (error) {
        console.error("Post job error:", error);
        return res.status(500).json({ error: "Server error: " + error.message });
    }
});

// GET all jobs (public search)
router.get("/getalljob", auth, async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            status: 'active',
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { location: { $regex: keyword, $options: "i" } },
                { jobtype: { $regex: keyword, $options: "i" } },
                { position: { $regex: keyword, $options: "i" } }
            ],
        };

        const jobs = await job.find(query).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(400).json({ error: "No jobs found", status: false });
        }
        return res.status(200).json({ message: "Jobs fetched successfully", jobs, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", status: false });
    }
});

// GET a single job by ID
router.get("/getjobbyid/:id", async (req, res) => {
    try {
        const jobId = req.params.id;
        const singleJob = await job.findById(jobId);
        if (!singleJob) {
            return res.status(404).json({ error: "Job not found", status: false });
        }
        return res.status(200).json({ job: singleJob, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", status: false });
    }
});

// GET all jobs posted by the recruiter
router.get("/getalljobs", auth, async (req, res) => {
    try {
        const adminId = req.user._id || req.user.id;
        const jobs = await job.find({ created_by: adminId }).sort({ createdAt: -1 });
        return res.status(200).json({ jobs: jobs || [], success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", status: false });
    }
});

// PUT update job status (active / closed / draft)
router.put("/:id/status", auth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'closed', 'draft'].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }
        const updatedJob = await job.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedJob) return res.status(404).json({ error: "Job not found" });
        return res.status(200).json({ message: "Job status updated", job: updatedJob, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

// DELETE a job
router.delete("/:id", auth, async (req, res) => {
    try {
        const recruiterId = req.user._id || req.user.id;
        const foundJob = await job.findOne({ _id: req.params.id, created_by: recruiterId });
        if (!foundJob) return res.status(404).json({ error: "Job not found or unauthorized" });
        await job.findByIdAndDelete(req.params.id);
        // Also delete all applications for this job
        await Application.deleteMany({ job: req.params.id });
        return res.status(200).json({ message: "Job deleted successfully", success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

// GET applicants for a specific job
router.get("/:id/applicants", auth, async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.id })
            .populate("applicant", "-password")
            .sort({ createdAt: -1 });

        const applicants = applications.map(app => ({
            applicationId: app._id,
            status: app.status,
            appliedAt: app.createdAt,
            ...app.applicant.toObject()
        }));

        return res.status(200).json({ applicants, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

export default router;