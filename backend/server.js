
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import express from "express";
import myRoutes from "./signup.js";
import loginRoutes from "./login.js";
import dashboardRoutes from "./dashboard.js";
import path from "path";


dotenv.config()

const app = express()
app.use(cors())

app.use(express.json())
app.use(cookieParser())
app.use("/api", myRoutes);
app.use("/api",loginRoutes)
app.use("/api", dashboardRoutes)

// serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

mongoose.connect(process.env.database_ID)

.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.listen(5000,()=>
    console.log('Server is running at http://localhost:5000/'))