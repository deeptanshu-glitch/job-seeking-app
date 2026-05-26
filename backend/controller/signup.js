import express from "express"
import bcrypt from "bcryptjs"

import User from "../database/dbuser.js"
import { isValidEmail, isValidPhone, isValidPassword, isValidRole, sanitizeString } from "../utils/validation.js"

const router = express.Router()

router.post('/signup', async (req, res) => {
   try {
        const { fullname, username, email, phonenumber, password, role } = req.body;
        const cleanFullname = sanitizeString(fullname);
        const cleanUsername = sanitizeString(username);
        const cleanEmail = sanitizeString(email).toLowerCase();
        const cleanPhone = sanitizeString(phonenumber);
        const cleanRole = sanitizeString(role);

        if (!cleanFullname || !cleanUsername || !cleanEmail || !cleanPhone || !password || !cleanRole) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (!isValidEmail(cleanEmail)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        if (!isValidPhone(cleanPhone)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        if (!isValidRole(cleanRole)) {
            return res.status(400).json({ error: "Invalid role provided" });
        }

        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const existingUsername = await User.findOne({ username: cleanUsername });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const existingPhone = await User.findOne({ phonenumber: cleanPhone });
        if (existingPhone) {
            return res.status(400).json({ error: "Phone number already exists" });
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullname: cleanFullname,
            username: cleanUsername,
            email: cleanEmail,
            phonenumber: cleanPhone,
            password: hashedpassword,
            role: cleanRole
        })

        await user.save();
        res.status(201).json({ message: "User Registered Successfully", success: true });

   } catch (err) {
       console.error(err);
       res.status(500).json({ success: false, error: "Server error" });
   }
});

export default router;
    
