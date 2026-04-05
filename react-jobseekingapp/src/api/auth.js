import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const signup = (formData) => API.post("/signup", formData);
export const login = (data) => axios.post("http://localhost:5000/api/login", data);

API.interceptors.request.use((req) => {
  const token = Cookies.get("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
