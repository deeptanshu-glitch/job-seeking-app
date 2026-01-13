import React from "react";
import "./signup.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup } from "./api/auth";


function Signup() {
  const navigate = useNavigate();

  const [form , setForm ] = useState({
    fullname:"",
    username:"",
    email:"",
    phonenumber:"",
    password:"",
    confirmpassword:""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (form.password !== form.confirmpassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await signup({
      fullname: form.fullname,
      username: form.username,
      email: form.email,
      phonenumber: form.phonenumber,
      password: form.password,
    });

    alert(res.data.message);
  } catch (err) {
    alert(err.response?.data?.error || "Server Error");
  }
};



  return (
    <div className="overlay">
      <div className="card" style={{ position: "relative" }}>
        <span className="close-btn" onClick={() => navigate("/")}>×</span>

        <h2>Create Your Account</h2>
        <p className="subtitle">Start your career journey with us</p>

        <form className="signup-form" onSubmit={handleSubmit}>
        
          <div className="field">
            <label>Full Name</label>
            <input name='fullname' type="text" placeholder="Enter your full name" onChange={handleChange} required />
          </div>
        
          <div className="field">
            <label>User Name</label>
            <input name="username" type="text" placeholder="Enter username" onChange={handleChange} required />
          </div>
        
          <div className="field">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="Enter your email" onChange={handleChange} required />
          </div>
        
          <div className="field">
            <label>Phone</label>
            <input name='phonenumber' type="tel" placeholder="Enter phone number" onChange={handleChange} required />
          </div>
        
          <div className="field">
            <label>Password</label>
            <input name='password' type="password" placeholder="Create password" onChange={handleChange} required />
          </div>
        
          <div className="field">
            <label>Confirm Password</label>
            <input type="password" name="confirmpassword" placeholder="Confirm password" onChange={handleChange} required />
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

