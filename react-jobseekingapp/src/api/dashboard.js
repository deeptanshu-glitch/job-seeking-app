import API from "./auth";

export const getDashboard = () => {
  return API.get("/dashboard");
};

export const getSeekerDashboard = () => {
  return API.get("/seeker-dashboard");
};
