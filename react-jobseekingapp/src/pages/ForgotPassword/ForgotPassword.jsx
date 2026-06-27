import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword, verifyOtp, resetPassword } from "../../api/auth";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  // phase: 1 (Request OTP), 2 (Verify OTP), 3 (Reset Password)
  const [phase, setPhase] = useState(1);
  const [identifier, setIdentifier] = useState(""); // email or phonenumber
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    // basic check to see if it's an email or phone number
    const isEmail = identifier.includes("@");
    const payload = isEmail ? { email: identifier } : { phonenumber: identifier };
    
    try {
      const res = await forgotPassword(payload);
      setMessage(res.data.message);
      setPhase(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const isEmail = identifier.includes("@");
    const payload = isEmail 
        ? { email: identifier, otp } 
        : { phonenumber: identifier, otp };

    try {
      const res = await verifyOtp(payload);
      setResetToken(res.data.resetToken);
      setMessage(res.data.message);
      setPhase(3);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const res = await resetPassword({ newPassword: passwords.newPassword }, resetToken);
      setMessage(res.data.message);
      
      // Delay navigation slightly so they can read the success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="overlay">
      <div className="card forgot-password-card">
        <span className="close-btn" onClick={() => navigate("/login")}>×</span>

        {phase === 1 && (
          <>
            <h2>Forgot Password</h2>
            <p className="subtitle">Enter your email or phone number to receive an OTP</p>
            <form onSubmit={handleRequestOtp}>
              <label>Email or Phone Number</label>
              <input 
                type="text" 
                placeholder="Ex: user@mail.com or 9876543210" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)} 
                required 
              />
              {error && <p className="form-error">{error}</p>}
              {message && <p className="form-success">{message}</p>}
              <button type="submit">Send OTP</button>
            </form>
          </>
        )}

        {phase === 2 && (
          <>
            <h2>Verify OTP</h2>
            <p className="subtitle">Enter the 6-digit code sent to {identifier}</p>
            <form onSubmit={handleVerifyOtp}>
              <label>OTP Code</label>
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)} 
                required 
              />
              {error && <p className="form-error">{error}</p>}
              {message && <p className="form-success">{message}</p>}
              <button type="submit">Verify Code</button>
            </form>
          </>
        )}

        {phase === 3 && (
          <>
            <h2>Reset Password</h2>
            <p className="subtitle">Enter your new secure password</p>
            <form onSubmit={handleResetPassword}>
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="New Password" 
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                required 
              />
              <label>Confirm Password</label>
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                required 
              />
              {error && <p className="form-error">{error}</p>}
              {message && <p className="form-success">{message}</p>}
              <button type="submit">Update Password</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
