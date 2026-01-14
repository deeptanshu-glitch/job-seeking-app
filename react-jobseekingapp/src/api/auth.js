import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const signup = (formData) => API.post("/signup", formData);
export const login = (data) => axios.post("http://localhost:5000/api/login", data);