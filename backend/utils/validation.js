import mongoose from "mongoose";

export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  const phoneRegex = /^[0-9+\-()\s]{7,20}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= 6;
};

export const isValidRole = (role) => {
  return role === "job seeker" || role === "recruiter";
};

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
