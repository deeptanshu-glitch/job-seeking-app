 import React , { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./postjob.css";
import API from "./api/auth";

function Postjob(){

   const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [inputData, setinputData] = useState({
    title: "",
    description: "",
    requirements: [],
    salary: "",
    experience: "",
    location: "",
    jobtype: "",
    position: "",
    company: ""
  });

      const [addInputs, setaddInputs] = useState();
  
    const handleChange = (e) => {
    setinputData({ ...inputData, [e.target.name]: e.target.value });
    };

    const handleBack = () => {
        navigate(-1);
    }
 
    const addItem = (field) => {
        const value = addInputs[field]?.trim();
        if (!value) return;
        setEditData(prev => ({ ...prev, [field]: [...(prev[field] || []), value] }));
        setEditInputs(prev => ({ ...prev, [field]: '' }));
    };

    
    return(
        <div classname="post-container">
            <div classname="column column-left">
             <button onClick={handleBack} className="back-btn">← Back</button>
            <h3> Job Portal </h3>
            <ul className="sidebar-links">
                <li><button type="button" className="sidebar-link" >Overview</button></li>
            </ul>
        </div>   

         <div classname="column column-center">
            {loading && <p className="loading">Loading page...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && !jobs && <p className="error">No Jobs created</p>}
            {jobs && (
                <div className="job-list">
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    <div className="postjob-header">
                        
                    </div>    
                </div>
            )}
        </div>   
            
        </div>
    )
}

export default Postjob
