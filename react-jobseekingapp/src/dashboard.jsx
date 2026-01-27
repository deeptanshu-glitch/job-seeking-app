import React, { useEffect, useState } from "react";
import CollapsibleExample from "./navafter";
import ControlledCarousel from "./carousel";
import "./dashboard.css";
import { getDashboard } from "./api/dashboard";

function Dash() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
