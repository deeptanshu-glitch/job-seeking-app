import express from "express"
import bcrypt from "bcryptjs"

import User from "./database.js"

const router = express.Router()

router.post('/signup',async(req,res)=>{

   try{
        const { fullname, username, email, phonenumber, password } = req.body;


        const hashedpassword = await bcrypt.hash(password,10)       // 10 is strong as well as more secured type. 8 is faster but less secure whereas 12 is more secure but slow
       
        const user = new User ({
            fullname,
            username,
            email,
            phonenumber,
            password: hashedpassword
        })

        await user.save();
        res.status(201).json({ message:"User Registered Successfully" });

       } catch (err) {
       res.status(500).json({ error:"User already exists" });
       }

       
}); 



export default router;
    
