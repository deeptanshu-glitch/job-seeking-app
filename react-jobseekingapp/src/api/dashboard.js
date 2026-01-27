import API from "./auth";

export const getDashboard = () => {
  return API.get("/dashboard");
};


