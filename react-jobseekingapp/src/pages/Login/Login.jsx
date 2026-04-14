import React from "react";
import "./Login.css";
import { useNavigate, Link  } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import { login } from "../../api/auth";


 function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("job seeker");

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
      const res = await login({ ...form, role });

      console.log(res.data.message);

    Cookies.set("token", res.data.token, { expires: 7 });
    Cookies.set("user", JSON.stringify(res.data.user), { expires: 7 });

      
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
        
          <div className="role-selector">
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

           <label >Enter email</label>
           <input name="email" type="text" placeholder="Email" onChange={handleChange} required />
           <label>Enter Password</label>
           <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
           <div className="forgot-password-link">
             <Link to="/forgotpassword">Forgot Password?</Link>
           </div>
           {error && <p className="form-error">{error}</p>}
           <button type="submit">Login</button>
       </form>

        <Link to='/signup'><span className="footer-text">New here? Create an account</span></Link>
      </div>
    </div>
  );
}

export default Login