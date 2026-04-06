import React, { useEffect, useState } from "react";
import CollapsibleExample from "../../components/NavAfter";
import ControlledCarousel from "../../components/Carousel";
import "./Dashboard.css";
import ProfileHeader from "../../components/ProfileHeader";
import { getDashboard } from "../../api/dashboard";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function Dash() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    const user = userCookie ? JSON.parse(userCookie) : null;
    
    if (user?.role === 'recruiter') {
      navigate("/post");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        console.log("Dashboard data:", res.data);
        setLoading(false);
      } catch (err) {
        console.log("Unauthorized or token expired",err);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading dashboard...</h2>;
  }

  return (
    <div className="dashboard">
      <CollapsibleExample />
      <ControlledCarousel />
      
    </div>
  );
}

export default Dash;
