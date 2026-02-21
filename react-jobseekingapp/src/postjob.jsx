//  import React /*, { useEffect, useState, useRef }*/ from "react";
// import { useNavigate } from "react-router-dom";
// import "./postjob.css";
// import API from "./api/auth";

// function Postjob(){

//    const navigate = useNavigate();

//    const handleBack = () => {
//         navigate(-1);
//     }

    
//     return(
//         <div classname="post-container">
//             <div classname="column column-left">
//              <button onClick={handleBack} className="back-btn">← Back</button>
//             <h3> Job Portal </h3>
//             <ul className="sidebar-links">
//                 <li><button type="button" className="sidebar-link" >Overview</button></li>
//             </ul>
//         </div>   
            
            
//         </div>
//     )
// }

// export default Postjob

import React, { useState, useEffect } from "react";
import "./postjob.css";

function Postjob() {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    experience: "",
    location: "",
    jobtype: "",
    position: "",
    company: ""
  });

  // Fetch jobs
  useEffect(() => {
    fetch("http://localhost:5000/getalljob", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.jobs) setJobs(data.jobs);
      });
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit job
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/postjob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      setJobs([...jobs, data.job]);
      setFormData({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        experience: "",
        location: "",
        jobtype: "",
        position: "",
        company: ""
      });
    }
  };

  return (
    <div className="postjob-page">
      {/* Left Sidebar */}
      <div className="sidebar">
        <h3>Overview</h3>
        <h3>Your Jobs</h3>
        <button onClick={() => window.history.back()}>Back</button>
      </div>

      {/* Right Main Content */}
      <div className="main">
        <h2>Post a New Job</h2>
        <form className="job-form" onSubmit={handleSubmit}>
          {Object.keys(formData).map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              required
            />
          ))}
          <button type="submit">➕ Create Job</button>
        </form>

        <h2>Your Posted Jobs</h2>
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h4>{job.title}</h4>
              <p>{job.description}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary}</p>
              <p><strong>Experience:</strong> {job.experience}</p>
              <p><strong>Type:</strong> {job.jobtype}</p>
              <p><strong>Position:</strong> {job.position}</p>

              <div className="applicants">
                {job.applications?.map((app) => (
                  <div key={app._id} className="applicant">
                    <a href={`/profile/${app.applicant?._id}`}>
                      {app.applicant?.name}
                    </a>
                    <span>Status: {app.status}</span>
                    <button
                      onClick={() =>
                        fetch(`http://localhost:5000/application/${app._id}/accept`, {
                          method: "PUT",
                          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                        })
                      }
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        fetch(`http://localhost:5000/application/${app._id}/reject`, {
                          method: "PUT",
                          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                        })
                      }
                    >
                      Reject
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Postjob;
