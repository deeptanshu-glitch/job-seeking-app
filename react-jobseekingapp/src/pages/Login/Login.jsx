import React, { useEffect, useRef } from "react";
import "./Login.css";
import { useNavigate, Link  } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import { login, googleAuth } from "../../api/auth";


 function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("job seeker");

  const [form , setForm ] = useState({
    email:"",
    password:""
  })

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleChange =(e) =>{
    setForm({...form, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setIsLoading(true);
    try {
      const res = await login({ ...form, role });
      console.log(res.data.message);
      Cookies.set("token", res.data.token, { expires: 7 });
      Cookies.set("user", JSON.stringify(res.data.user), { expires: 7 });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setIsLoading(false);
    }
  
  

  }
  

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
            setError(err.response?.data?.error || 'Google sign-in failed');
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
  }, [navigate]);


  const handleClose = () => {
    setIsClosing(true);
  };

  const handleOverlayAnimationEnd = (event) => {
    if (!isClosing) return;
    if (event.target !== event.currentTarget) return;
    navigate("/");
  };

  return (
    <div className={`overlay${isClosing ? ' closing' : ''}`} onAnimationEnd={handleOverlayAnimationEnd}>
      <div className={`card${isClosing ? ' closing' : ''}`} style={{ position: "relative" }}>
        <span className="close-btn" onClick={handleClose}>×</span>

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