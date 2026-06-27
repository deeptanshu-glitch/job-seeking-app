import express from "express";
import job from "../database/db.recruiter.js";
import Application from "../database/db.application.js";
import User from "../database/dbuser.js";
import auth, { requireRole } from "../middleware.js";
import { isValidObjectId, sanitizeString, sanitizeArray } from "../utils/validation.js";
import { runValidation, postJobChecks } from "../utils/validators.js";

const router = express.Router();

// POST a new job
router.post("/postjob", auth, requireRole("recruiter"), runValidation(postJobChecks), async (req, res) => {
    try {
        const { title, description, requirements, salary, experience, location, jobtype, position, companyName } = req.body;
        const cleanTitle = sanitizeString(title);
        const cleanDescription = sanitizeString(description);
        const cleanLocation = sanitizeString(location);
        const cleanJobType = sanitizeString(jobtype);
        const cleanPosition = sanitizeString(position);
        const cleanCompanyName = sanitizeString(companyName);
        const cleanSalary = sanitizeString(salary) || "Not specified";
        const cleanExperience = sanitizeString(experience) || "";
        const reqList = sanitizeArray(requirements);

        if (!cleanTitle || !cleanDescription || !cleanLocation || !cleanJobType || !cleanPosition || !cleanCompanyName) {
            return res.status(400).json({ success: false, error: "All required fields must be filled" });
        }

        const userId = req.user._id || req.user.id;
        const newJob = await job.create({
            title: cleanTitle,
            description: cleanDescription,
            requirements: reqList,
            salary: cleanSalary,
            experience: cleanExperience,
            location: cleanLocation,
            jobtype: cleanJobType,
            position: cleanPosition,
            companyName: cleanCompanyName,
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
        if (!isValidObjectId(jobId)) {
            return res.status(400).json({ error: "Invalid job ID", status: false });
        }
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
router.get("/getalljobs", auth, requireRole("recruiter"), async (req, res) => {
    try {
        const recruiterId = req.user._id || req.user.id;
        const jobs = await job.find({ created_by: recruiterId }).sort({ createdAt: -1 });
        return res.status(200).json({ jobs: jobs || [], success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", status: false });
    }
});

// PUT update job status (active / closed / draft)
router.put("/:id/status", auth, requireRole("recruiter"), async (req, res) => {
    try {
        const status = sanitizeString(req.body.status);
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid job ID" });
        }

        if (!['active', 'closed', 'draft'].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const recruiterId = req.user._id || req.user.id;
        const existingJob = await job.findById(req.params.id);
        if (!existingJob) return res.status(404).json({ error: "Job not found" });
        if (existingJob.created_by?.toString() !== recruiterId.toString()) {
            return res.status(403).json({ error: "Unauthorized to update this job" });
        }

        const updatedJob = await job.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        return res.status(200).json({ message: "Job status updated", job: updatedJob, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

// DELETE a job
router.delete("/:id", auth, requireRole("recruiter"), async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid job ID" });
        }

        const recruiterId = req.user._id || req.user.id;
        const foundJob = await job.findOne({ _id: req.params.id, created_by: recruiterId });
        if (!foundJob) {
            return res.status(404).json({ success: false, error: "Job not found or unauthorized" });
        }
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
router.get("/:id/applicants", auth, requireRole("recruiter"), async (req, res) => {
    try {
        const recruiterId = req.user._id || req.user.id;
        const jobId = req.params.id;

        if (!isValidObjectId(jobId)) {
            return res.status(400).json({ error: "Invalid job ID" });
        }

        const foundJob = await job.findById(jobId);
        if (!foundJob) return res.status(404).json({ error: "Job not found" });
        if (foundJob.created_by?.toString() !== recruiterId.toString()) {
            return res.status(403).json({ error: "Unauthorized to view applicants for this job" });
        }

        const applications = await Application.find({ job: jobId })
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