import express from "express"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import nodemailer from "nodemailer"
import sendSms from "../utils/sms.js"
import User from "../database/dbuser.js"
import { isValidEmail, isValidPhone, isValidPassword, sanitizeString } from "../utils/validation.js"
import { runValidation, forgotPasswordChecks, verifyOtpChecks, resetPasswordChecks } from "../utils/validators.js"

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


router.post('/forgotpassword', runValidation(forgotPasswordChecks), async (req, res) => {
    try {
        const { email, phonenumber } = req.body;
        const cleanEmail = sanitizeString(email).toLowerCase();
        const cleanPhone = sanitizeString(phonenumber);

        if (!cleanEmail && !cleanPhone) {
            return res.error("Please provide email or phone number", 400);
        }

        if (cleanEmail && !isValidEmail(cleanEmail)) {
            return res.error("Invalid email address", 400);
        }

        if (cleanPhone && !isValidPhone(cleanPhone)) {
            return res.error("Invalid phone number", 400);
        }

        const query = cleanEmail ? { email: cleanEmail } : { phonenumber: cleanPhone };
        const user = await User.findOne(query);

        if (!user) {
            return res.error("User not found with this identifier", 404);
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and expiry (10 mins)
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        if (cleanEmail) {
            await sendOtpEmail(cleanEmail, otp);
            return res.success({ message: "OTP sent to your email" });
        }
        await sendOtpSms(cleanPhone, otp);
        return res.success({ message: "OTP sent to your phone number" });

    } catch (err) {
        console.error(err);
        return res.error("Server error", 500, err.message);
    }
});

router.post('/verifyotp', runValidation(verifyOtpChecks), async (req, res) => {
    try {
        const { email, phonenumber, otp } = req.body;
        const cleanEmail = sanitizeString(email).toLowerCase();
        const cleanPhone = sanitizeString(phonenumber);

        if ((!cleanEmail && !cleanPhone) || !otp) {
            return res.error("Provide identifier and OTP", 400);
        }

        if (cleanEmail && !isValidEmail(cleanEmail)) {
            return res.error("Invalid email address", 400);
        }

        if (cleanPhone && !isValidPhone(cleanPhone)) {
            return res.error("Invalid phone number", 400);
        }

        const query = cleanEmail ? { email: cleanEmail } : { phonenumber: cleanPhone };
        const user = await User.findOne(query);

        if (!user) {
            return res.error("User not found", 404);
        }

        if (user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
            return res.error("Invalid or expired OTP", 400);
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

        return res.success({
            message: "OTP verified successfully",
            resetToken
        });

    } catch (err) {
        console.error(err);
        return res.error("Server error", 500, err.message);
    }
});

router.post('/resetpassword', runValidation(resetPasswordChecks), async (req, res) => {
    try {
        const { newPassword } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.error("Reset token missing", 401);
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.error("Invalid or expired reset token", 401);
        }

        if (!decoded.resetPermission) {
            return res.error("Invalid token type", 401);
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.error("User not found", 404);
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetOtp = null;
        user.resetOtpExpires = null;

        await user.save();

        return res.success({ message: "Password reset successfully. You can now login." });

    } catch (err) {
        console.error(err);
        return res.error("Server error", 500, err.message);
    }
});

export default router;
