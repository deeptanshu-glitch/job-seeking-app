import express from "express"
import bcrypt from "bcryptjs"

import User from "../database/dbuser.js"
import { isValidEmail, isValidPhone, isValidPassword, isValidRole } from "../utils/validation.js"

const router = express.Router()

router.post('/signup', async (req, res) => {
   try {
        const { fullname, username, email, phonenumber, password, role } = req.body;

        if (!fullname || !username || !email || !phonenumber || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        if (!isValidPhone(phonenumber)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        if (!isValidRole(role)) {
            return res.status(400).json({ error: "Invalid role provided" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const existingPhone = await User.findOne({ phonenumber });
        if (existingPhone) {
            return res.status(400).json({ error: "Phone number already exists" });
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullname,
            username,
            email,
            phonenumber,
            password: hashedpassword,
            role
        })

        await user.save();
        res.status(201).json({ message: "User Registered Successfully" });

   } catch (err) {
       console.error(err);
       res.status(500).json({ error: "Server error" });
   }
});

export default router;
    
