import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import "./NavAfter.css";

function NavAfter() {
  const navigate = useNavigate();
  const userCookie = Cookies.get("user");
  const user = userCookie ? JSON.parse(userCookie) : null;
  const role = user?.role || 'job seeker';

  const handleSignout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    navigate("/");
  };

  return (
    <nav className="app-navbar">
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-brand">
          <span className="nav-brand-icon">🔍</span>
          <span>Job Finder</span>
        </Link>
        <div className="nav-center">
          {role !== 'recruiter' && (
            <div className="nav-search">
              <span className="nav-search-icon">🔍</span>
              <input type="text" placeholder="Search for jobs..." />
            </div>
          )}
        </div>
        <div className="nav-right">
          <Link to="/dashboard" className="nav-link">Home</Link>
          {role === 'recruiter' ? (
            <Link to="/post" className="nav-cta-btn">Recruiter Dashboard</Link>
          ) : (
            <Link to="/profile" className="nav-cta-btn">Profile</Link>
          )}
          <button onClick={handleSignout} className="nav-signout-btn">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavAfter;