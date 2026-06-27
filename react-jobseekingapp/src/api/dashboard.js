import API from "./auth";

export const getDashboard = () => {
  return API.get("/dashboard");
};

export const getSeekerDashboard = () => {
  return API.get("/seeker-dashboard");
};

export const markNotificationsAsRead = (ids) => {
  return API.patch("/notifications/mark-read", { ids });
};
