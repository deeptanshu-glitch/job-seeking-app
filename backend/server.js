import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv"
import express from "express";
import path from "path";
import helmet from "helmet";
import myRoutes from "./controller/signup.js";
import loginRoutes from "./controller/login.js";
import dashboardRoutes from "./controller/dashboard.js";
import jobRoutes from "./controller/postjob.js";
import statusRoutes from "./controller/status.js";
import resetPasswordRoutes from "./controller/resetpassword.js";
import responseMiddleware from "./utils/response.js";
import logger from "./utils/logger.js";

dotenv.config()

const app = express()
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions))

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
});

app.use(helmet());
app.use(responseMiddleware);

app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))

app.use("/api", myRoutes);
app.use("/api", loginRoutes)
app.use("/api", dashboardRoutes)
app.use("/api/job", jobRoutes)
app.use("/api", statusRoutes)
app.use("/api", resetPasswordRoutes)


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
})

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ success: false, error: err.message || "Internal server error" });
})

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.database_ID)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection failed:", err));

app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}/`))