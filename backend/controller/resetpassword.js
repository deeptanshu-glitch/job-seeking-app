import express from "express"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import nodemailer from "nodemailer"
import User from "../database/dbuser.js"
import { isValidEmail, isValidPhone, isValidPassword } from "../utils/validation.js"

const router = express.Router()

// Setup nodemailer transporter (Placeholder - needs real credentials in .env later)
// For testing, we can use ethereal or just console.log the OTP if transporter fails
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Middleware to log OTP if email isn't configured properly
const sendOtpEmail = async (email, otp) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`\n\n-----------------------------------------`);
        console.log(`[DEVELOPMENT MODE] Email not configured.`);
        console.log(`OTP for ${email} is: ${otp}`);
        console.log(`-----------------------------------------\n\n`);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully to", email);
    } catch (err) {
        console.error("Error sending email:", err);
        console.log(`[DEVELOPMENT FAILOVER] OTP for ${email} is: ${otp}`);
    }
}


const sendOtpSms = async (phone, otp) => {
    // Placeholder for actual SMS integration (Twilio, etc.)
    console.log(`\n\n-----------------------------------------`);
    console.log(`[DEVELOPMENT MODE] SMS not configured.`);
    console.log(`OTP for ${phone} is: ${otp}`);
    console.log(`-----------------------------------------\n\n`);
}


router.post('/forgotpassword', async (req, res) => {
    try {
        const { email, phonenumber } = req.body;

        if (!email && !phonenumber) {
            return res.status(400).json({ error: "Please provide email or phone number" });
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        if (phonenumber && !isValidPhone(phonenumber)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }

        const query = email ? { email } : { phonenumber };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ error: "User not found with this identifier" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and expiry (10 mins)
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        if (email) {
            await sendOtpEmail(email, otp);
            res.json({ message: "OTP sent to your email" });
        } else {
            await sendOtpSms(phonenumber, otp);
            res.json({ message: "OTP sent to your phone number" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/verifyotp', async (req, res) => {
    try {
        const { email, phonenumber, otp } = req.body;

        if ((!email && !phonenumber) || !otp) {
            return res.status(400).json({ error: "Provide identifier and OTP" });
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        if (phonenumber && !isValidPhone(phonenumber)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }

        const query = email ? { email } : { phonenumber };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Generate temporary token for resetting password (valid for 15 mins)
        const resetToken = jwt.sign(
            { id: user._id, role: user.role, resetPermission: true },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Optionally clear OTP here, or after password reset
        // Doing it after reset is safer in case they close the page before typing new password

        res.json({
            message: "OTP verified successfully",
            resetToken
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/resetpassword', async (req, res) => {
    try {
        const { newPassword } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Reset token missing" });
        }

        const token = authHeader.split(' ')[1];

        if (!newPassword) {
            return res.status(400).json({ error: "Provide new password" });
        }

        if (!isValidPassword(newPassword)) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: "Invalid or expired reset token" });
        }

        if (!decoded.resetPermission) {
            return res.status(401).json({ error: "Invalid token type" });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetOtp = null;
        user.resetOtpExpires = null;

        await user.save();

        res.json({ message: "Password reset successfully. You can now login." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
