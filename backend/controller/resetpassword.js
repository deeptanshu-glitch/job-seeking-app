import express from "express"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import nodemailer from "nodemailer"
import sendSms from "../utils/sms.js"
import User from "../database/dbuser.js"
import { isValidEmail, isValidPhone, isValidPassword, sanitizeString } from "../utils/validation.js"

const router = express.Router()

// Setup nodemailer transporter using SMTP credentials from env
let transporter;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    transporter = null; // Development fallback logged below
}

// Middleware to log OTP if email isn't configured properly
const sendOtpEmail = async (email, otp) => {
    if (!transporter) {
        console.log(`\n\n-----------------------------------------`);
        console.log(`[DEVELOPMENT MODE] Email not configured.`);
        console.log(`OTP for ${email} is: ${otp}`);
        console.log(`-----------------------------------------\n\n`);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
    try {
        const sent = await sendSms(phone, `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`);
        if (!sent) {
            console.log(`\n\n[DEVELOPMENT FAILOVER] OTP for ${phone} is: ${otp}\n\n`);
        }
    } catch (err) {
        console.error('SMS send error:', err);
        console.log(`\n\n[DEVELOPMENT FAILOVER] OTP for ${phone} is: ${otp}\n\n`);
    }
}


router.post('/forgotpassword', async (req, res) => {
    try {
        const { email, phonenumber } = req.body;
        const cleanEmail = sanitizeString(email).toLowerCase();
        const cleanPhone = sanitizeString(phonenumber);

        if (!cleanEmail && !cleanPhone) {
            return res.status(400).json({ error: "Please provide email or phone number" });
        }

        if (cleanEmail && !isValidEmail(cleanEmail)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        if (cleanPhone && !isValidPhone(cleanPhone)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }

        const query = cleanEmail ? { email: cleanEmail } : { phonenumber: cleanPhone };
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

        if (cleanEmail) {
            await sendOtpEmail(cleanEmail, otp);
            res.json({ message: "OTP sent to your email" });
        } else {
            await sendOtpSms(cleanPhone, otp);
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
        const cleanEmail = sanitizeString(email).toLowerCase();
        const cleanPhone = sanitizeString(phonenumber);

        if ((!cleanEmail && !cleanPhone) || !otp) {
            return res.status(400).json({ error: "Provide identifier and OTP" });
        }

        if (cleanEmail && !isValidEmail(cleanEmail)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        if (cleanPhone && !isValidPhone(cleanPhone)) {
            return res.status(400).json({ error: "Invalid phone number" });
        }

        const query = cleanEmail ? { email: cleanEmail } : { phonenumber: cleanPhone };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.resetOtp = null;
        user.resetOtpExpires = null;
        await user.save();

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
