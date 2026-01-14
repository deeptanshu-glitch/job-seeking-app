import express from "express"
import bcryptjs from "bcryptjs"

import User from "./database.js"

const router = express.Router()

router.post('/login',async(req,res)=>{

    try{
    const { email , password } = req.body;

    const user = await User.findOne({ email })

    if( !user ){
        return res.status(400).json({error: "Email doesn't exist"})
       }

    const verifypass = await bcryptjs.compare(password,user.password)

    if( !verifypass ){
        return res.status(400).json({error: "Incorrect password"})
    }

    res.json({
      message: "Login successful",
       user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router

    




