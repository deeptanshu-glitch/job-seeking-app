import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./PostJob.css";
import API from "../../api/auth";
import Cookies from "js-cookie";
import { uploadToCloudinary } from "../../api/cloudinary";

/* ─── helpers ─────────────────────────────────────────────── */
const initJobForm = () => ({
    title: "", description: "", requirements: [],
    salary: "", experience: "", location: "",
    jobtype: "", position: "", companyName: ""
});

const REQUIRED_PROFILE_FIELDS = ["companyName", "position"];

function isProfileComplete(user) {
    if (!user) return false;
    return REQUIRED_PROFILE_FIELDS.every(f => user[f] && String(user[f]).trim() !== "");
}

/* ─── component ────────────────────────────────────────────── */
function Postjob() {
    const navigate = useNavigate();

    // ── auth & profile ──────────────────────────────
    const [recruiter, setRecruiter] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardData, setOnboardData] = useState({
        companyName: "", position: "", location: "",
        companyWebsite: "", companyDescription: ""
    });
    const [onboardSaving, setOnboardSaving] = useState(false);
    const [onboardError, setOnboardError] = useState("");

    // ── right-panel profile edit ────────────────────
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileEdit, setProfileEdit] = useState({});
    const [profileSaving, setProfileSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState("");

    // ── navigation ──────────────────────────────────
    const [currentView, setCurrentView] = useState("overview");

    // ── jobs ────────────────────────────────────────
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedJob, setSelectedJob] = useState(null);

    // ── applicants ──────────────────────────────────
    const [applicants, setApplicants] = useState([]);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    // ── post-job form ───────────────────────────────
    const [inputData, setInputData] = useState(initJobForm());
    const [reqInput, setReqInput] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitting, setFormSubmitting] = useState(false);

    // ── toasts ──────────────────────────────────────
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    /* ── fetch fresh recruiter profile from API ─── */
    const fetchRecruiter = useCallback(async () => {
        setProfileLoading(true);
        try {
            const res = await API.get("/dashboard");
            const user = res.data.user;
            setRecruiter(user);
            setImagePreview(user.image || "");
            setProfileEdit({
                fullname: user.fullname || "",
                phonenumber: user.phonenumber || "",
                email: user.email || "",
                companyName: user.companyName || "",
                position: user.position || "",
                location: user.location || "",
                companyWebsite: user.companyWebsite || "",
                companyDescription: user.companyDescription || ""
            });
            if (!isProfileComplete(user)) {
                setOnboardData(prev => ({
                    ...prev,
                    companyName: user.companyName || "",
                    position: user.position || "",
                    location: user.location || "",
                    companyWebsite: user.companyWebsite || "",
                    companyDescription: user.companyDescription || ""
                }));
                setShowOnboarding(true);
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
        } finally {
            setProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        const userCookie = Cookies.get("user");
        const cookieUser = userCookie ? JSON.parse(userCookie) : null;
        if (cookieUser?.role !== "recruiter") {
            navigate("/dashboard");
            return;
        }
        fetchRecruiter();
    }, [navigate, fetchRecruiter]);

    /* ── load jobs ─────────────────────────────── */
    const loadJobs = useCallback(async () => {
        setJobsLoading(true);
        try {
            const res = await API.get("/job/getalljobs");
            setJobs(res.data.jobs || []);
        } catch (err) {
            showToast("Failed to load jobs", err);
        } finally {
            setJobsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentView === "overview" || currentView === "my-jobs") {
            loadJobs();
        }
    }, [currentView, loadJobs]);

    /* ── fetch applicants ─────────────────────── */
    const fetchApplicants = async (jobId) => {
        setApplicantsLoading(true);
        setApplicants([]);
        try {
            const res = await API.get(`/job/${jobId}/applicants`);
            setApplicants(res.data.applicants || []);
        } catch (err) {
            showToast("Failed to load applicants",err);
        } finally {
            setApplicantsLoading(false);
        }
    };

    const handleJobClick = (job) => {
        setSelectedJob(job);
        setSelectedApplicant(null);
        fetchApplicants(job._id);
    };

    /* ── applicant action ─────────────────────── */
    const handleApplicantAction = async (appId, action) => {
        setActionLoading(prev => ({ ...prev, [appId]: true }));
        try {
            await API.put(`/application/${appId}/${action}`);
            setApplicants(prev => prev.map(a =>
                a.applicationId === appId
                    ? { ...a, status: action === "accept" ? "accepted" : "rejected" }
                    : a
            ));
            showToast(`Applicant ${action === "accept" ? "accepted" : "rejected"}`, action === "accept" ? "success" : "error");
        } catch (err) {
            showToast("Action failed", "error", err);
        } finally {
            setActionLoading(prev => ({ ...prev, [appId]: false }));
        }
    };

    /* ── job status change ────────────────────── */
    const handleStatusChange = async (jobId, newStatus, e) => {
        e.stopPropagation();
        try {
            await API.put(`/job/${jobId}/status`, { status: newStatus });
            setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
            showToast(`Job marked as ${newStatus}`);
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    /* ── delete job ───────────────────────────── */
    const handleDeleteJob = async (jobId, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this job posting?")) return;
        try {
            await API.delete(`/job/${jobId}`);
            setJobs(prev => prev.filter(j => j._id !== jobId));
            showToast("Job deleted");
        } catch (err) {
            showToast("Failed to delete job", "error");
        }
    };

    /* ── post-job form ────────────────────────── */
    const validateForm = () => {
        const errors = {};
        if (!inputData.title.trim()) errors.title = "Job title is required";
        if (!inputData.description.trim()) errors.description = "Description is required";
        if (!inputData.location.trim()) errors.location = "Location is required";
        if (!inputData.jobtype) errors.jobtype = "Select a job type";
        if (!inputData.position.trim()) errors.position = "Position is required";
        if (!inputData.companyName.trim()) errors.companyName = "Company name is required";
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
    };

    const addRequirement = () => {
        const val = reqInput.trim();
        if (!val) return;
        setInputData(prev => ({ ...prev, requirements: [...prev.requirements, val] }));
        setReqInput("");
    };

    const removeRequirement = (idx) => {
        setInputData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormSubmitting(true);
        try {
            await API.post("/job/postjob", inputData);
            showToast("Job posted successfully! 🎉");
            setInputData({ ...initJobForm(), companyName: recruiter?.companyName || "" });
            setFormErrors({});
            setTimeout(() => setCurrentView("my-jobs"), 1500);
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to post job", "error");
        } finally {
            setFormSubmitting(false);
        }
    };

    /* ── onboarding save ──────────────────────── */
    const handleOnboardSave = async () => {
        if (!onboardData.companyName.trim() || !onboardData.position.trim()) {
            setOnboardError("Company name and position are required.");
            return;
        }
        setOnboardSaving(true);
        setOnboardError("");
        try {
            const res = await API.post("/update-profile", onboardData);
            const updated = res.data.user;
            setRecruiter(updated);
            setProfileEdit({
                fullname: updated.fullname || "",
                phonenumber: updated.phonenumber || "",
                email: updated.email || "",
                companyName: updated.companyName || "",
                position: updated.position || "",
                location: updated.location || "",
                companyWebsite: updated.companyWebsite || "",
                companyDescription: updated.companyDescription || ""
            });
            setInputData(prev => ({ ...prev, companyName: updated.companyName || "" }));
            setShowOnboarding(false);
            showToast("Profile completed! Welcome aboard 🚀");
        } catch (err) {
            setOnboardError("Failed to save. Please try again.");
        } finally {
            setOnboardSaving(false);
        }
    };

    /* ── right-panel profile save ─────────────── */
    const handleProfileSave = async () => {
        setProfileSaving(true);
        try {
            const res = await API.post("/update-profile", profileEdit);
            const updated = res.data.user;
            setRecruiter(updated);
            setImagePreview(updated.image || "");
            setEditingProfile(false);
            showToast("Profile updated ✓");
        } catch (err) {
            showToast("Failed to save profile", "error");
        } finally {
            setProfileSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        try {
            setImageUploading(true);
            const url = await uploadToCloudinary(file, "image");
            setProfileEdit(prev => ({ ...prev, imageUrl: url }));
        } catch (err) {
            showToast("Image upload failed", "error");
        } finally {
            setImageUploading(false);
        }
    };

    /* ── derived stats ────────────────────────── */
    const stats = {
        total: jobs.length,
        active: jobs.filter(j => j.status === "active").length,
        closed: jobs.filter(j => j.status === "closed").length,
        draft: jobs.filter(j => j.status === "draft").length,
        totalApplicants: jobs.reduce((sum, j) => sum + (j.applications?.length || 0), 0)
    };

    const filteredJobs = jobs.filter(j => {
        const matchSearch = !searchQuery ||
            j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || j.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleSignout = () => {
        Cookies.remove("token");
        Cookies.remove("user");
        navigate("/");
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
        setSelectedJob(null);
        setSelectedApplicant(null);
        setApplicants([]);
    };

    /* ─── auto-fill company name when entering post-job ─── */
    useEffect(() => {
        if (currentView === "post-job" && recruiter?.companyName) {
            setInputData(prev => ({
                ...prev,
                companyName: prev.companyName || recruiter.companyName
            }));
        }
    }, [currentView, recruiter]);

    /* ══════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════ */
    return (
        <>
            {/* ─── Onboarding Modal ─────────────────────── */}
            {showOnboarding && (
                <div className="onboard-overlay">
                    <div className="onboard-modal">
                        <div className="onboard-icon">🏢</div>
                        <h2>Complete Your Recruiter Profile</h2>
                        <p className="onboard-sub">
                            Tell us about your company before you start posting jobs.
                        </p>
                        {onboardError && <div className="onboard-error">{onboardError}</div>}
                        <div className="onboard-form">
                            <div className="ob-field">
                                <label>Company Name <span>*</span></label>
                                <input
                                    type="text"
                                    value={onboardData.companyName}
                                    onChange={e => setOnboardData(p => ({ ...p, companyName: e.target.value }))}
                                    placeholder="e.g., Acme Corp"
                                />
                            </div>
                            <div className="ob-field">
                                <label>Your Position / Role <span>*</span></label>
                                <input
                                    type="text"
                                    value={onboardData.position}
                                    onChange={e => setOnboardData(p => ({ ...p, position: e.target.value }))}
                                    placeholder="e.g., HR Manager"
                                />
                            </div>
                            <div className="ob-field">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={onboardData.location}
                                    onChange={e => setOnboardData(p => ({ ...p, location: e.target.value }))}
                                    placeholder="e.g., New York, USA"
                                />
                            </div>
                            <div className="ob-field">
                                <label>Company Website</label>
                                <input
                                    type="url"
                                    value={onboardData.companyWebsite}
                                    onChange={e => setOnboardData(p => ({ ...p, companyWebsite: e.target.value }))}
                                    placeholder="https://yourcompany.com"
                                />
                            </div>
                            <div className="ob-field ob-full">
                                <label>Company Description</label>
                                <textarea
                                    value={onboardData.companyDescription}
                                    onChange={e => setOnboardData(p => ({ ...p, companyDescription: e.target.value }))}
                                    placeholder="Briefly describe your company..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="onboard-actions">
                            <button
                                className="ob-save-btn"
                                onClick={handleOnboardSave}
                                disabled={onboardSaving}
                            >
                                {onboardSaving ? "Saving..." : "Complete Profile & Continue →"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Toast ──────────────────────────────────── */}
            {toast && (
                <div className={`pj-toast pj-toast-${toast.type}`}>{toast.msg}</div>
            )}

            {/* ─── Main Layout ─────────────────────────────── */}
            <div className="post-container">

                {/* ── Left Sidebar ───────────────────────── */}
                <div className="column column-left">
                    <div className="sidebar-brand">
                        <span className="sidebar-logo">💼</span>
                        <h3>Job Portal</h3>
                    </div>
                    <nav className="sidebar-nav">
                        {[
                            { key: "overview", label: "📊 Overview", icon: "" },
                            { key: "post-job", label: "➕ Post a Job", icon: "" },
                            { key: "my-jobs", label: "📋 My Jobs", icon: "" },
                        ].map(item => (
                            <button
                                key={item.key}
                                className={`sidebar-link ${currentView === item.key ? "active" : ""}`}
                                onClick={() => handleViewChange(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                    <div className="sidebar-footer">
                        <button className="signout-btn" onClick={handleSignout}>Sign Out</button>
                    </div>
                </div>

                {/* ── Center Panel ───────────────────────── */}
                <div className="column column-center">

                    {/* ── OVERVIEW ──────────────────────── */}
                    {currentView === "overview" && !selectedJob && (
                        <div className="center-content">
                            <div className="page-header">
                                <div>
                                    <h2>Welcome back, {recruiter?.fullname?.split(" ")[0] || "Recruiter"} 👋</h2>
                                    <p className="page-sub">Here's what's happening with your jobs today.</p>
                                </div>
                                <button className="primary-btn" onClick={() => handleViewChange("post-job")}>
                                    + Post a Job
                                </button>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card stat-total">
                                    <div className="stat-num">{stats.total}</div>
                                    <div className="stat-label">Total Jobs</div>
                                </div>
                                <div className="stat-card stat-active">
                                    <div className="stat-num">{stats.active}</div>
                                    <div className="stat-label">Active</div>
                                </div>
                                <div className="stat-card stat-closed">
                                    <div className="stat-num">{stats.closed}</div>
                                    <div className="stat-label">Closed</div>
                                </div>
                                <div className="stat-card stat-applicants">
                                    <div className="stat-num">{stats.totalApplicants}</div>
                                    <div className="stat-label">Total Applicants</div>
                                </div>
                            </div>

                            <div className="section-title">Recent Postings</div>
                            {jobsLoading ? (
                                <div className="pj-loading"><span className="spinner" />Loading jobs...</div>
                            ) : jobs.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h4>No jobs posted yet</h4>
                                    <p>Start by posting your first job opening.</p>
                                    <button className="primary-btn" onClick={() => handleViewChange("post-job")}>
                                        Post First Job
                                    </button>
                                </div>
                            ) : (
                                <div className="jobs-list">
                                    {jobs.slice(0, 5).map(job => (
                                        <JobCard
                                            key={job._id}
                                            job={job}
                                            onClick={() => handleJobClick(job)}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDeleteJob}
                                        />
                                    ))}
                                    {jobs.length > 5 && (
                                        <button className="view-all-btn" onClick={() => handleViewChange("my-jobs")}>
                                            View all {jobs.length} jobs →
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── MY JOBS ───────────────────────── */}
                    {currentView === "my-jobs" && !selectedJob && (
                        <div className="center-content">
                            <div className="page-header">
                                <h2>My Jobs</h2>
                                <button className="primary-btn" onClick={() => handleViewChange("post-job")}>+ Post a Job</button>
                            </div>

                            <div className="jobs-toolbar">
                                <div className="search-bar">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by title, company, location..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="filter-tabs">
                                    {["all", "active", "closed", "draft"].map(s => (
                                        <button
                                            key={s}
                                            className={`filter-tab ${statusFilter === s ? "active" : ""}`}
                                            onClick={() => setStatusFilter(s)}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {jobsLoading ? (
                                <div className="pj-loading"><span className="spinner" />Loading jobs...</div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🔎</div>
                                    <h4>No jobs found</h4>
                                    <p>{searchQuery || statusFilter !== "all" ? "Try adjusting your filters." : "Post your first job to get started."}</p>
                                </div>
                            ) : (
                                <div className="jobs-list">
                                    {filteredJobs.map(job => (
                                        <JobCard
                                            key={job._id}
                                            job={job}
                                            onClick={() => handleJobClick(job)}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDeleteJob}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── JOB DETAIL + APPLICANTS ───────── */}
                    {selectedJob && !selectedApplicant && (
                        <div className="center-content">
                            <div className="page-header">
                                <button className="back-btn" onClick={() => setSelectedJob(null)}>← Back</button>
                                <StatusBadge status={selectedJob.status} />
                            </div>

                            <div className="job-detail-card">
                                <h2>{selectedJob.title}</h2>
                                <div className="job-meta-row">
                                    <span>🏢 {selectedJob.companyName}</span>
                                    <span>📍 {selectedJob.location}</span>
                                    <span>🕐 {selectedJob.jobtype}</span>
                                    {selectedJob.salary && selectedJob.salary !== "Not specified" && (
                                        <span>💰 {selectedJob.salary}</span>
                                    )}
                                    {selectedJob.experience && <span>⭐ {selectedJob.experience}</span>}
                                </div>

                                {selectedJob.requirements?.length > 0 && (
                                    <div className="job-section">
                                        <h4>Requirements</h4>
                                        <div className="req-tags">
                                            {selectedJob.requirements.map((r, i) => (
                                                <span key={i} className="req-tag">{r}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedJob.description && (
                                    <div className="job-section">
                                        <h4>Description</h4>
                                        <p className="job-desc">{selectedJob.description}</p>
                                    </div>
                                )}

                                <div className="job-actions-row">
                                    <div className="status-select-group">
                                        <label>Status:</label>
                                        <select
                                            value={selectedJob.status}
                                            onChange={e => handleStatusChange(selectedJob._id, e.target.value, e)}
                                        >
                                            <option value="active">Active</option>
                                            <option value="closed">Closed</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={e => { handleDeleteJob(selectedJob._id, e); setSelectedJob(null); }}
                                    >
                                        🗑 Delete Job
                                    </button>
                                </div>
                            </div>

                            <div className="section-title" style={{ marginTop: 32 }}>
                                Applicants ({applicants.length})
                            </div>

                            {applicantsLoading ? (
                                <div className="pj-loading"><span className="spinner" />Loading applicants...</div>
                            ) : applicants.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">👥</div>
                                    <h4>No applicants yet</h4>
                                    <p>Applicants will appear here once they apply.</p>
                                </div>
                            ) : (
                                <div className="applicants-list">
                                    {applicants.map(applicant => (
                                        <div
                                            key={applicant.applicationId}
                                            className="applicant-card"
                                            onClick={() => setSelectedApplicant(applicant)}
                                        >
                                            <div className="applicant-avatar">
                                                {applicant.image
                                                    ? <img src={applicant.image} alt={applicant.fullname} />
                                                    : <span>{applicant.fullname?.charAt(0).toUpperCase() || "?"}</span>
                                                }
                                            </div>
                                            <div className="applicant-info">
                                                <h4>{applicant.fullname}</h4>
                                                <p>{applicant.email}</p>
                                                {applicant.skills && <p className="skill-preview">🛠 {applicant.skills.split(";").slice(0, 3).join(", ")}</p>}
                                            </div>
                                            <div className="applicant-right">
                                                <span className={`app-status app-status-${applicant.status}`}>
                                                    {applicant.status}
                                                </span>
                                                <div className="app-actions" onClick={e => e.stopPropagation()}>
                                                    {applicant.status === "pending" && (
                                                        <>
                                                            <button
                                                                className="accept-btn"
                                                                disabled={!!actionLoading[applicant.applicationId]}
                                                                onClick={() => handleApplicantAction(applicant.applicationId, "accept")}
                                                            >
                                                                {actionLoading[applicant.applicationId] ? "..." : "✓ Accept"}
                                                            </button>
                                                            <button
                                                                className="reject-btn"
                                                                disabled={!!actionLoading[applicant.applicationId]}
                                                                onClick={() => handleApplicantAction(applicant.applicationId, "reject")}
                                                            >
                                                                {actionLoading[applicant.applicationId] ? "..." : "✗ Reject"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── APPLICANT FULL PROFILE ────────── */}
                    {selectedApplicant && (
                        <div className="center-content">
                            <div className="page-header">
                                <button className="back-btn" onClick={() => setSelectedApplicant(null)}>← Back to Applicants</button>
                                <span className={`app-status app-status-${selectedApplicant.status}`}>
                                    {selectedApplicant.status}
                                </span>
                            </div>

                            <div className="applicant-profile-card">
                                <div className="appl-header">
                                    <div className="appl-avatar-lg">
                                        {selectedApplicant.image
                                            ? <img src={selectedApplicant.image} alt={selectedApplicant.fullname} />
                                            : <span>{selectedApplicant.fullname?.charAt(0).toUpperCase()}</span>
                                        }
                                    </div>
                                    <div className="appl-header-info">
                                        <h2>{selectedApplicant.fullname}</h2>
                                        <p>@{selectedApplicant.username}</p>
                                        <p>{selectedApplicant.email} · {selectedApplicant.phonenumber}</p>
                                    </div>
                                    {selectedApplicant.status === "pending" && (
                                        <div className="appl-actions">
                                            <button
                                                className="accept-btn accept-btn-lg"
                                                disabled={!!actionLoading[selectedApplicant.applicationId]}
                                                onClick={() => handleApplicantAction(selectedApplicant.applicationId, "accept")}
                                            >
                                                ✓ Accept
                                            </button>
                                            <button
                                                className="reject-btn reject-btn-lg"
                                                disabled={!!actionLoading[selectedApplicant.applicationId]}
                                                onClick={() => handleApplicantAction(selectedApplicant.applicationId, "reject")}
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {[
                                    { label: "Education 🎓", value: selectedApplicant.education },
                                    { label: "Experience 💼", value: selectedApplicant.experience },
                                    { label: "Skills 🛠", value: selectedApplicant.skills },
                                    { label: "Links 🔗", value: selectedApplicant.links }
                                ].map(({ label, value }) => value && (
                                    <div key={label} className="appl-section">
                                        <h4>{label}</h4>
                                        <div className="tag-list-display">
                                            {value.split(/;|,/).map((v, i) => v.trim() && (
                                                <span key={i} className="tag-chip">{v.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {Array.isArray(selectedApplicant.resume) && selectedApplicant.resume.length > 0 && (
                                    <div className="appl-section">
                                        <h4>Resume / cv 📄</h4>
                                        <div className="resume-links">
                                            {selectedApplicant.resume.map((url, i) => (
                                                <a key={i} href={url} target="_blank" rel="noreferrer" className="resume-link-btn">
                                                    📄 {url.split("/").pop() || `Document ${i + 1}`}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── POST A JOB FORM ───────────────── */}
                    {currentView === "post-job" && !selectedJob && !selectedApplicant && (
                        <div className="center-content">
                            <div className="page-header post-job-header">
                                <div>
                                    <h2>Post a New Job</h2>
                                    <p className="page-sub">Fill in the details to attract the right candidates.</p>
                                </div>
                                <button
                                    type="button"
                                    className="mobile-back-btn"
                                    onClick={() => handleViewChange("overview")}
                                    aria-label="Back to overview"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="post-job-form" noValidate>
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.title ? "has-error" : ""}`}>
                                        <label>Job Title <span className="req-star">*</span></label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={inputData.title}
                                            onChange={handleChange}
                                            placeholder="e.g., Senior React Developer"
                                        />
                                        {formErrors.title && <span className="field-error">{formErrors.title}</span>}
                                    </div>
                                    <div className={`form-group ${formErrors.companyName ? "has-error" : ""}`}>
                                        <label>Company <span className="req-star">*</span></label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={inputData.companyName}
                                            onChange={handleChange}
                                            placeholder="e.g., Acme Corp"
                                        />
                                        {formErrors.companyName && <span className="field-error">{formErrors.companyName}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className={`form-group ${formErrors.location ? "has-error" : ""}`}>
                                        <label>Location <span className="req-star">*</span></label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={inputData.location}
                                            onChange={handleChange}
                                            placeholder="e.g., Remote / New York"
                                        />
                                        {formErrors.location && <span className="field-error">{formErrors.location}</span>}
                                    </div>
                                    <div className={`form-group ${formErrors.position ? "has-error" : ""}`}>
                                        <label>Position <span className="req-star">*</span></label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={inputData.position}
                                            onChange={handleChange}
                                            placeholder="e.g., Frontend Engineer"
                                        />
                                        {formErrors.position && <span className="field-error">{formErrors.position}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className={`form-group ${formErrors.jobtype ? "has-error" : ""}`}>
                                        <label>Job Type <span className="req-star">*</span></label>
                                        <select name="jobtype" value={inputData.jobtype} onChange={handleChange}>
                                            <option value="">Select type</option>
                                            <option value="full-time">Full-Time</option>
                                            <option value="part-time">Part-Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="freelance">Freelance</option>
                                            <option value="internship">Internship</option>
                                        </select>
                                        {formErrors.jobtype && <span className="field-error">{formErrors.jobtype}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Experience Level</label>
                                        <select name="experience" value={inputData.experience} onChange={handleChange}>
                                            <option value="">Select level</option>
                                            <option value="entry">Entry Level</option>
                                            <option value="mid">Mid Level</option>
                                            <option value="senior">Senior Level</option>
                                            <option value="executive">Executive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Salary Range</label>
                                    <input
                                        type="text"
                                        name="salary"
                                        value={inputData.salary}
                                        onChange={handleChange}
                                        placeholder="e.g., $60,000 – $80,000 / yr"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Requirements</label>
                                    <div className="req-input-row">
                                        <input
                                            type="text"
                                            value={reqInput}
                                            onChange={e => setReqInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addRequirement(); } }}
                                            placeholder="Type a requirement and press Enter"
                                        />
                                        <button type="button" className="add-req-btn" onClick={addRequirement}>Add</button>
                                    </div>
                                    {inputData.requirements.length > 0 && (
                                        <div className="req-tags-edit">
                                            {inputData.requirements.map((r, i) => (
                                                <span key={i} className="req-tag-edit">
                                                    {r}
                                                    <button type="button" onClick={() => removeRequirement(i)}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className={`form-group ${formErrors.description ? "has-error" : ""}`}>
                                    <label>
                                        Job Description <span className="req-star">*</span>
                                        <span className="char-count">{inputData.description.length} chars</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={inputData.description}
                                        onChange={handleChange}
                                        placeholder="Describe the role, responsibilities, and what you're looking for..."
                                        rows={7}
                                    />
                                    {formErrors.description && <span className="field-error">{formErrors.description}</span>}
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="primary-btn" disabled={formSubmitting}>
                                        {formSubmitting ? <><span className="spinner-sm" /> Posting...</> : "🚀 Post Job"}
                                    </button>
                                    <button type="button" className="secondary-btn" onClick={() => { setInputData(initJobForm()); setFormErrors({}); }}>
                                        Clear Form
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* ── Right Panel ─────────────────────────── */}
                <div className="column column-right">
                    <div className="rp-panel-title">
                        <div>
                            <p className="rp-panel-label">Recruiter Profile</p>
                            <h3>Manage your recruiter details</h3>
                        </div>
                    </div>

                    {profileLoading ? (
                        <div className="pj-loading"><span className="spinner" />Loading profile...</div>
                    ) : recruiter ? (
                        <>
                            <div className="rp-header">
                                <label htmlFor="avatar-upload" className="rp-avatar-wrap" title="Change photo">
                                    {imagePreview
                                        ? <img src={imagePreview} alt="avatar" className="rp-avatar-img" />
                                        : <div className="rp-avatar-placeholder">
                                            {recruiter.fullname?.charAt(0).toUpperCase() || "R"}
                                        </div>
                                    }
                                    {editingProfile && (
                                        <>
                                            <div className="rp-avatar-overlay">📷</div>
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                style={{ display: "none" }}
                                                onChange={handleImageUpload}
                                                disabled={imageUploading}
                                            />
                                        </>
                                    )}
                                </label>
                                {!editingProfile ? (
                                    <>
                                        <h3 className="rp-name">{recruiter.fullname}</h3>
                                        <span className="rp-role">Recruiter</span>
                                        {recruiter.position && <span className="rp-position">{recruiter.position}</span>}
                                        <button className="rp-edit-btn" onClick={() => setEditingProfile(true)}>✏️ Edit Profile</button>
                                    </>
                                ) : null}
                            </div>

                            {!editingProfile ? (
                                <div className="rp-info">
                                    {recruiter.companyName && (
                                        <div className="rp-info-item">
                                            <span className="rp-info-icon">🏢</span>
                                            <span>{recruiter.companyName}</span>
                                        </div>
                                    )}
                                    {recruiter.location && (
                                        <div className="rp-info-item">
                                            <span className="rp-info-icon">📍</span>
                                            <span>{recruiter.location}</span>
                                        </div>
                                    )}
                                    {recruiter.email && (
                                        <div className="rp-info-item">
                                            <span className="rp-info-icon">✉️</span>
                                            <span>{recruiter.email}</span>
                                        </div>
                                    )}
                                    {recruiter.phonenumber && (
                                        <div className="rp-info-item">
                                            <span className="rp-info-icon">📞</span>
                                            <span>{recruiter.phonenumber}</span>
                                        </div>
                                    )}
                                    {recruiter.companyWebsite && (
                                        <div className="rp-info-item">
                                            <span className="rp-info-icon">🌐</span>
                                            <a href={recruiter.companyWebsite} target="_blank" rel="noreferrer">{recruiter.companyWebsite}</a>
                                        </div>
                                    )}
                                    {recruiter.companyDescription && (
                                        <div className="rp-desc">
                                            <p>{recruiter.companyDescription}</p>
                                        </div>
                                    )}
                                    <div className="rp-divider" />
                                    <div className="rp-mini-stats">
                                        <div className="rp-mini-stat">
                                            <strong>{stats.active}</strong>
                                            <span>Active Jobs</span>
                                        </div>
                                        <div className="rp-mini-stat">
                                            <strong>{stats.totalApplicants}</strong>
                                            <span>Applicants</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rp-edit-form">
                                    <h4>Edit Profile</h4>
                                    {imageUploading && <p className="uploading-txt">⏳ Uploading image...</p>}
                                    {[
                                        { name: "fullname", label: "Full Name", type: "text" },
                                        { name: "phonenumber", label: "Phone", type: "tel" },
                                        { name: "companyName", label: "Company", type: "text" },
                                        { name: "position", label: "Your Position", type: "text" },
                                        { name: "location", label: "Location", type: "text" },
                                        { name: "companyWebsite", label: "Company Website", type: "url" },
                                    ].map(f => (
                                        <div key={f.name} className="rp-field">
                                            <label>{f.label}</label>
                                            <input
                                                type={f.type}
                                                value={profileEdit[f.name] || ""}
                                                onChange={e => setProfileEdit(p => ({ ...p, [f.name]: e.target.value }))}
                                            />
                                        </div>
                                    ))}
                                    <div className="rp-field">
                                        <label>Company Description</label>
                                        <textarea
                                            value={profileEdit.companyDescription || ""}
                                            onChange={e => setProfileEdit(p => ({ ...p, companyDescription: e.target.value }))}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="rp-edit-actions">
                                        <button className="primary-btn-sm" onClick={handleProfileSave} disabled={profileSaving}>
                                            {profileSaving ? "Saving..." : "Save"}
                                        </button>
                                        <button className="ghost-btn-sm" onClick={() => setEditingProfile(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}

/* ── Sub-components ────────────────────────────────────────── */
function StatusBadge({ status }) {
    const map = { active: "🟢", closed: "🔴", draft: "⚫" };
    return (
        <span className={`status-badge badge-${status}`}>
            {map[status] || "⚪"} {status}
        </span>
    );
}

function JobCard({ job, onClick, onStatusChange, onDelete }) {
    return (
        <div className="job-card" onClick={onClick}>
            <div className="job-card-top">
                <div>
                    <h4 className="job-card-title">{job.title}</h4>
                    <p className="job-card-company">🏢 {job.companyName} · 📍 {job.location}</p>
                </div>
                <StatusBadge status={job.status} />
            </div>
            <div className="job-card-meta">
                <span className="meta-pill">{job.jobtype}</span>
                {job.experience && <span className="meta-pill">{job.experience}</span>}
                {job.salary && job.salary !== "Not specified" && <span className="meta-pill">💰 {job.salary}</span>}
                <span className="meta-pill">👥 {job.applications?.length || 0} applicants</span>
            </div>
            <div className="job-card-actions" onClick={e => e.stopPropagation()}>
                <select
                    className="status-select-inline"
                    value={job.status}
                    onChange={e => onStatusChange(job._id, e.target.value, e)}
                >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                </select>
                <button className="delete-btn-sm" onClick={e => onDelete(job._id, e)}>🗑</button>
            </div>
        </div>
    );
}

export default Postjob;