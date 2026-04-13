import express from "express";
import auth from "../middleware.js";
import User from "../database/dbuser.js";
import Application from "../database/db.application.js";
import Job from "../database/db.recruiter.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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
router.get("/seeker-dashboard", auth, async (req, res) => {
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

    console.log('=== UPDATE PROFILE REQUEST ===');
    console.log('User ID:', req.user.id);
    console.log('Body fields:', { fullname, email, phonenumber, education, experience, skills, resumeText, links, companyName, companyWebsite, companyDescription, location, position, image, resume });
    console.log('Files received:', req.files ? Object.keys(req.files) : 'None');
    
    const update = {};
    if (fullname && fullname.trim()) update.fullname = fullname.trim();
    if (email && email.trim()) update.email = email.trim();
    if (phonenumber && phonenumber.trim()) update.phonenumber = phonenumber.trim();
    if (education !== undefined) update.education = education || '';
    if (experience !== undefined) update.experience = experience || '';
    if (skills !== undefined) update.skills = skills || '';
    if (resumeText !== undefined) update.resumeText = resumeText || '';
    if (links !== undefined) update.links = links || '';
    if (companyName !== undefined) update.companyName = companyName || '';
    if (companyWebsite !== undefined) update.companyWebsite = companyWebsite || '';
    if (companyDescription !== undefined) update.companyDescription = companyDescription || '';
    if (location !== undefined) update.location = location || '';
    if (position !== undefined) update.position = position || '';
    
    // Cloudinary URLs sent directly from frontend
    if (image !== undefined) update.image = image;
    if (resume !== undefined) {
      update.resume = Array.isArray(resume) ? resume : [resume];
    }

    console.log('Update object before files:', update);
    
    
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        update.image = `/uploads/${req.files.image[0].filename}`;
        console.log('Image file uploaded:', update.image);
      }
      if (req.files.resume && req.files.resume.length) {
        const newPaths = req.files.resume.map(f => `/uploads/${f.filename}`);
        console.log('Resume files uploaded:', newPaths);
        
        
        const existingUser = await User.findById(req.user.id).select('resume');
        console.log('Existing user resume field:', existingUser?.resume);
        
        const existing = Array.isArray(existingUser?.resume) ? existingUser.resume : (existingUser?.resume ? [existingUser.resume] : []);
        console.log('Parsed existing resumes:', existing);
        
        update.resume = existing.concat(newPaths);
        console.log('Final resume array:', update.resume);
      }
    }

    console.log('Final update object:', update);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true, runValidators: false }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    console.log('User updated successfully:', updatedUser._id);
    console.log('=== UPDATE COMPLETE ===');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('=== UPDATE PROFILE ERROR ===');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

export default router