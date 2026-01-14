
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv"

import express from "express";
import myRoutes from "./signup.js";
import loginRoutes from "./login.js";



dotenv.config()

const app = express()
app.use(cors())

app.use(express.json())
app.use("/api", myRoutes);
app.use("/api",loginRoutes)

mongoose.connect(process.env.database_ID)

.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.listen(5000,()=>
    console.log('Server is running at http://localhost:5000/'))