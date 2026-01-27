import React from "react";
import "./login.css";
import { useNavigate, Link  } from "react-router-dom";
import { useState } from "react"
import { login } from "./api/auth";


 function Login() {
  const navigate = useNavigate();

  const [form , setForm ] = useState({
    email:"",
    password:""
  })

  const [error, setError] = useState("");

  const handleChange =(e) =>{
    setForm({...form, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (e) =>{
    e.preventDefault()


    try {
      const res = await login(form);

      console.log(res.data.message);

    localStorage.setItem("token",res.data.token);
    localStorage.setItem("user",JSON.stringify(res.data.user));

      
    navigate("/dashboard");

      
    } catch (err) {
      setError(err.response?.data?.error || "Server error");

    }
  
  

  }
  


  return (
    <div className="overlay">
      <div className="card" style={{ position: "relative" }}>
        <span className="close-btn" onClick={() => navigate("/")}>×</span>

        <h2>Welcome back <br /><br /></h2>
        <form onSubmit={handleSubmit}>
           <label >Enter email</label>
           <input name="email" type="text" placeholder="Email" onChange={handleChange} required />
           <label>Enter Password</label>
           <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
           {error && <p className="form-error">{error}</p>}
           <button type="submit">Login</button>
       </form>

        <Link to='/signup'><span className="footer-text">New here? Create an account</span></Link>
      </div>
    </div>
  );
}

export default Login