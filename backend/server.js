
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv"

import express from "express";
import myRoutes from "./controller/signup.js";
import loginRoutes from "./controller/login.js";
import dashboardRoutes from "./controller/dashboard.js";
import jobRoutes from "./controller/postjob.js";
import statusRoutes from "./controller/status.js";
import resetPasswordRoutes from "./controller/resetpassword.js";
import path from "path";

dotenv.config()

const app = express()
app.use(cors())

app.use(express.json())

app.use("/api", myRoutes);
app.use("/api", loginRoutes)
app.use("/api", dashboardRoutes)
app.use("/api/job", jobRoutes)
app.use("/api", statusRoutes)
app.use("/api", resetPasswordRoutes)

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

mongoose.connect(process.env.database_ID)

.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.listen(process.env.PORT,()=>
    console.log('Server is running at http://localhost:5000/'))