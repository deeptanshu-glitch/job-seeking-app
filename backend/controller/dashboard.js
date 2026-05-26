import express from "express";
import auth, { requireRole } from "../middleware.js";
import User from "../database/dbuser.js";
import Application from "../database/db.application.js";
import Job from "../database/db.recruiter.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { isValidEmail, isValidPhone, sanitizeString, sanitizeArray } from "../utils/validation.js";

const router = express.Router();

router.get("/dashboard", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      message: "Welcome to dashboard",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// Seeker-specific dashboard data
router.get("/seeker-dashboard", auth, requireRole("job seeker"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });

    // Profile completion check
    const fields = ['fullname', 'email', 'phonenumber', 'education', 'experience', 'skills', 'image'];
    const filled = fields.filter(f => user[f] && user[f] !== '' && user[f] !== null).length;
    const profileCompletion = Math.round((filled / fields.length) * 100);

    // Applied jobs with populated job info
    const applications = await Application.find({ applicant: req.user.id })
      .populate({ path: 'job', model: 'job' })
      .sort({ createdAt: -1 })
      .limit(10);

    // Latest active jobs for discovery
    const latestJobs = await Job.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title companyName location salary jobtype experience createdAt');

    res.json({ user, profileCompletion, applications, latestJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch seeker dashboard" });
  }
});

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only JPG/JPEG/PDF/DOC/DOCX allowed'));
  }
  cb(null, true);
}});

router.post('/update-profile', auth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'resume', maxCount: 10 }]), async (req, res) => {
  try {
    const { fullname, email, phonenumber, education, experience, skills, resumeText, links, companyName, companyWebsite, companyDescription, location, position, image, resume } = req.body;

    const update = {};
    const cleanFullname = sanitizeString(fullname);
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanPhone = sanitizeString(phonenumber);

    if (cleanFullname) update.fullname = cleanFullname;
    if (cleanEmail) {
      if (!isValidEmail(cleanEmail)) {
        return res.status(400).json({ success: false, error: "Invalid email address" });
      }
      update.email = cleanEmail;
    }
    if (cleanPhone) {
      if (!isValidPhone(cleanPhone)) {
        return res.status(400).json({ success: false, error: "Invalid phone number" });
      }
      update.phonenumber = cleanPhone;
    }
    if (education !== undefined) update.education = sanitizeString(education);
    if (experience !== undefined) update.experience = sanitizeArray(experience).join('; ');
    if (skills !== undefined) update.skills = sanitizeArray(skills).join('; ');
    if (resumeText !== undefined) update.resumeText = sanitizeString(resumeText);
    if (links !== undefined) update.links = sanitizeArray(links).join('; ');
    if (companyName !== undefined) update.companyName = sanitizeString(companyName);
    if (companyWebsite !== undefined) update.companyWebsite = sanitizeString(companyWebsite);
    if (companyDescription !== undefined) update.companyDescription = sanitizeString(companyDescription);
    if (location !== undefined) update.location = sanitizeString(location);
    if (position !== undefined) update.position = sanitizeString(position);

    if (image !== undefined) update.image = sanitizeString(image);
    if (resume !== undefined) {
      update.resume = Array.isArray(resume) ? resume.map(sanitizeString).filter(Boolean) : [sanitizeString(resume)].filter(Boolean);
    }

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        update.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.resume && req.files.resume.length) {
        const newPaths = req.files.resume.map(f => `/uploads/${f.filename}`);
        const existingUser = await User.findById(req.user.id).select('resume');
        const existing = Array.isArray(existingUser?.resume) ? existingUser.resume : (existingUser?.resume ? [existingUser.resume] : []);
        update.resume = existing.concat(newPaths);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('=== UPDATE PROFILE ERROR ===', err);
    res.status(500).json({ success: false, error: 'Failed to update profile: ' + err.message });
  }
});

export default router