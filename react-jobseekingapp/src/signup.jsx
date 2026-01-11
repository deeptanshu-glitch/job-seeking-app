import React from "react";
import "./signup.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  return (
    <div className="overlay">
      <div className="card" style={{ position: "relative" }}>
        <span className="close-btn" onClick={() => navigate("/")}>×</span>

        <h2>Create Your Account</h2>
        <p className="subtitle">Start your career journey with us</p>

        <form className="signup-form">
        
          <div className="field">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" required />
          </div>
        
          <div className="field">
            <label>User Name</label>
            <input type="text" placeholder="Enter username" required />
          </div>
        
          <div className="field">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" required />
          </div>
        
          <div className="field">
            <label>Phone</label>
            <input type="tel" placeholder="Enter phone number" required />
          </div>
        
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Create password" required />
          </div>
        
          <div className="field">
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm password" required />
          </div>
        
          <div className="field full">
            <button type="submit">Create Account</button>
          </div>
        
        </form>
      </div>
    </div>
  );
}

export default Signup;

