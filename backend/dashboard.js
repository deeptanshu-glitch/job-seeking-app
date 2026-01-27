import express from "express";
import auth from "./middleware.js";

const router = express.Router();

router.get("/dashboard", auth, (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user
  });
});

export default router