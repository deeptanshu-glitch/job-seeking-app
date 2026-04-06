import express from "express"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../database/dbuser.js"

const router = express.Router()

router.post('/login',async(req,res)=>{

    try{
    const { email , password, role } = req.body;

    const user = await User.findOne({ email })

    if( !user ){
        return res.status(400).json({error: "Email doesn't exist"})
    }

    if (user.role && role && user.role !== role) {
        return res.status(400).json({error: "Account doesn't exist for this role"})
    }

    const verifypass = await bcryptjs.compare(password,user.password)

    if( !verifypass ){
        return res.status(400).json({error: "Incorrect password"})
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d'}
    )

    res.json({
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
    res.status(500).json({ error: "Server error" });
  }
});

export default router

    




