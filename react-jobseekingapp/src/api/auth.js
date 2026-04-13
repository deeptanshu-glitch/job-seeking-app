import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
});

export const signup = (formData) => API.post("/signup", formData);
export const login = (data) => axios.post(`${API_URL}/login`, data);

API.interceptors.request.use((req) => {
  const token = Cookies.get("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
