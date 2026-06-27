import React, { useEffect, useRef } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup, googleAuth } from "../../api/auth";
import Cookies from "js-cookie";



function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("job seeker");

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
    setIsLoading(true);

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
      role: role,
    });
    
    
    alert(res.data.message);
    navigate("/login");
    

  } catch (err) {
    alert(err.response?.data?.error || "Server Error");
  }
};

  const [isLoading, setIsLoading] = useState(false);

  const googleButtonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGSI = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) return;
          setIsLoading(true);
          try {
            const res = await googleAuth({ id_token: response.credential });
            Cookies.set("token", res.data.token, { expires: 7 });
            Cookies.set("user", JSON.stringify(res.data.user), { expires: 7 });
            navigate('/dashboard');
          } catch (err) {
            alert(err.response?.data?.error || 'Google sign-in failed');
            setIsLoading(false);
          }
        }
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large' });
      }
    };

    if (window.google && window.google.accounts && window.google.accounts.id) {
      initGSI();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGSI;
      document.head.appendChild(script);
    }
  }, []);



  return (
    <div className="overlay">
      <div className="card" style={{ position: "relative" }}>
        <span className="close-btn" onClick={() => navigate("/")}>×</span>

        <h2>Create Your Account</h2>
        <p className="subtitle">Start your career journey with us</p>

        <form className="signup-form" onSubmit={handleSubmit}>
        
          <div className="role-selector full">
            <button 
              type="button" 
              className={`role-btn ${role === 'job seeker' ? 'active' : ''}`}
              onClick={() => setRole('job seeker')}
            >
              Job Seeker
            </button>
            <button 
              type="button" 
              className={`role-btn ${role === 'recruiter' ? 'active' : ''}`}
              onClick={() => setRole('recruiter')}
            >
              Recruiter
            </button>
          </div>

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
            <button type="submit" >Create Account</button>
          </div>
        
        </form>
      </div>
    </div>
  );
}

export default Signup;

