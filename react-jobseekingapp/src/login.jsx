import React from "react";
import "./login.css";

function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your account</p>

        <form>
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>

        <span className="footer-text">New here? Create an account</span>
      </div>
    </div>
  );
}

export default Login