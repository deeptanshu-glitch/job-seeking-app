import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import API from "../../api/auth";
import "./JobDetail.css";
import NavAfter from "../../components/NavAfter";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [applying, setApplying] = useState(false);

  const userCookie = Cookies.get("user");
  const user = userCookie ? JSON.parse(userCookie) : null;
  const isRecruiter = user?.role === "recruiter";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/job/getjobbyid/${id}`);
        setJob(res.data.job);
      } catch (err) {
        showToast("Job not found or failed to load", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowConfirm(true);
  };

  const submitApplication = async () => {
    setApplying(true);
    try {
      await API.post(`/apply/${id}`);
      showToast("Application submitted successfully! 🎉", "success");
      setShowConfirm(false);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to submit application", "error");
      setShowConfirm(false);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <NavAfter />
        <div style={{ padding: "60px", textAlign: "center", width: "100%" }}>
           <h3 style={{color: "#6b7280"}}>Loading job details...</h3>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-page">
        <NavAfter />
        <div style={{ padding: "60px", textAlign: "center", width: "100%" }}>
           <h2 style={{color: "#111827"}}>Job Not Found</h2>
           <Link to="/dashboard" className="jd-back" style={{marginTop: "20px"}}>
             ← Back to Dashboard
           </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavAfter />
      <div className="job-detail-page">
        <div className="jd-container">
          <div className="jd-header">
            <Link to="/dashboard" className="jd-back">
              ← Back to Jobs
            </Link>
            <h1 className="jd-title">{job.title}</h1>
            <p className="jd-company">🏢 {job.companyName}</p>
            <div className="jd-meta-pills">
              <span className="jd-meta-pill">📍 {job.location || "Location not specified"}</span>
              <span className="jd-meta-pill">🕐 {job.jobtype || "Full Time"}</span>
              <span className="jd-meta-pill">💰 {job.salary || "Not specified"}</span>
              {job.experience && <span className="jd-meta-pill">⭐ {job.experience}</span>}
            </div>
          </div>

          <div className="jd-body">
            <h3 className="jd-section-title">Requirements</h3>
            {job.requirements && job.requirements.length > 0 ? (
              <div className="jd-requirements">
                {job.requirements.map((req, idx) => (
                  <span key={idx} className="jd-req-tag">{req}</span>
                ))}
              </div>
            ) : (
              <p className="jd-desc">No specific requirements listed.</p>
            )}

            <h3 className="jd-section-title">Job Description</h3>
            <p className="jd-desc">{job.description}</p>
          </div>

          {!isRecruiter && job.status !== "closed" && (
            <div className="jd-footer">
              <button className="jd-apply-btn" onClick={handleApplyClick}>
                Apply Now ✨
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <h3>Confirm Application</h3>
              <p>Are you sure you want to apply for the <strong>{job.title}</strong> role at {job.companyName}?</p>
              <div className="confirm-actions">
                <button className="btn-cancel" onClick={() => setShowConfirm(false)} disabled={applying}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={submitApplication} disabled={applying}>
                  {applying ? <><span className="spinner"></span> Applying...</> : "Yes, Apply"}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`jd-toast jd-toast-${toast.type}`}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}

export default JobDetail;
