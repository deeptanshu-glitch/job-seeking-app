import express from "express"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../database/dbuser.js"
import { isValidEmail, isValidPassword, sanitizeString } from "../utils/validation.js"
import { runValidation, loginChecks } from "../utils/validators.js"

const router = express.Router()

router.post('/login', runValidation(loginChecks), async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const cleanEmail = sanitizeString(email).toLowerCase();
        const cleanRole = sanitizeString(role);

        if (!isValidEmail(cleanEmail)) {
            return res.error("Invalid email address", 400);
        }

        const user = await User.findOne({ email: cleanEmail })

        if (!user) {
            return res.error("Email doesn't exist", 400);
        }

        if (user.role && cleanRole && user.role !== cleanRole) {
            return res.error("Account doesn't exist for this role", 400);
        }

        const verifypass = await bcryptjs.compare(password, user.password)

        if (!verifypass) {
            return res.error("Incorrect password", 400);
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        return res.success({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        return res.error("Server error", 500, err.message);
    }
});

export default router

    




