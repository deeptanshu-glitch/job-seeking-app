import express from "express";
import auth from "./middleware.js";
import User from "./database.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

router.get("/dashboard", auth, (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user
  });
});

// setup uploads folder
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
  const allowed = ['.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only JPG/JPEG allowed'));
  }
  cb(null, true);
}});

router.post('/update-profile', auth, upload.single('image'), async (req, res) => {
  try {
    const { fullname, email, phonenumber, education, experience } = req.body;

    const update = {};
    if (fullname) update.fullname = fullname;
    if (email) update.email = email;
    if (phonenumber) update.phonenumber = phonenumber;
    if (education) update.education = education;
    if (experience) update.experience = experience;

    if (req.file) {
      // save accessible URL path for client
      update.image = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router