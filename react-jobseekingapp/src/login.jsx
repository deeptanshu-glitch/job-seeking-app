import React from "react";
import "./login.css";
import { useNavigate, Link  } from "react-router-dom";

 function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-overlay">
      <div className="login-card" style={{ position: "relative" }}>
        <span className="close-btn" onClick={() => navigate("/")}>×</span>

        <h2>Welcome back <br /><br /></h2>
        <form>
           <input type="text" placeholder="Username" required />
           <input type="password" placeholder="Password" required />
           <button type="submit">Login</button>
       </form>

        <Link to='/signup'><span className="footer-text">New here? Create an account</span></Link>
      </div>
    </div>
  );
}

export default Login