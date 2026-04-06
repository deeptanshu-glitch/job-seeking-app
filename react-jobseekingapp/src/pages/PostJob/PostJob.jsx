import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PostJob.css";
import API from "../../api/auth";
import Cookies from "js-cookie";

function Postjob() {

    const navigate = useNavigate();

    useEffect(() => {
        const userCookie = Cookies.get("user");
        const user = userCookie ? JSON.parse(userCookie) : null;
        if (user?.role !== 'recruiter') {
            navigate("/dashboard");
        }
    }, [navigate]);

    const [currentView, setCurrentView] = useState('overview');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
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


    const loadPostedJobs = async (signal) => {
        setLoading(true);
        try {
            const response = await API.get('/job/getalljobs', { signal });
            setJobs(response.data.jobs || []);
        } catch (err) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                setError('Failed to load jobs: ' + (err.response?.data?.error || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async (jobId) => {
        try {
            // const response = await API.get(`/job/${jobId}/applicants`);
            // setApplicants(response.data.applicants || []);
            setApplicants([]);
        } catch (err) {
            setError('Failed to load applicants: ' + (err.response?.data?.error || err.message));
        }
    };


    useEffect(() => {
        if (currentView !== 'overview') return;

        const controller = new AbortController();
        loadPostedJobs(controller.signal);

        return () => controller.abort();
    }, [currentView]);

    const handleChange = (e) => {
        setinputData({ ...inputData, [e.target.name]: e.target.value });
    };


    const handleViewChange = (view) => {
        setCurrentView(view);
        setError(null);
        setSuccessMessage('');
        setSelectedJob(null);
        setApplicants([]);
        setSelectedApplicant(null);
    };

    const handleSignout = () => {
        Cookies.remove("token");
        Cookies.remove("user");
        navigate("/");
    };

    const handleJobClick = (job) => {
        setSelectedJob(job);
        fetchApplicants(job.id);
    };

    const handleApplicantClick = (applicant) => {
        setSelectedApplicant(applicant);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/job/postjob', inputData);
            setSuccessMessage('Job posted successfully!');
            setinputData({
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
            setTimeout(() => {
                setSuccessMessage('');

                setCurrentView('overview');
            }, 3000);
        } catch (err) {
            setError('Failed to post job: ' + (err.response?.data?.error || err.message));
        }
    };

    return (


        <div className="post-container">
            <div className="column column-left" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3> Job Portal </h3>
                <ul className="sidebar-links" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <li><button type="button" className={`sidebar-link ${currentView === 'overview' ? 'active' : ''}`} onClick={() => handleViewChange('overview')}>Overview</button></li>
                    <li><button type="button" className={`sidebar-link ${currentView === 'post-job' ? 'active' : ''}`} onClick={() => handleViewChange('post-job')}>Post a Job</button></li>
                    <li><button type="button" className={`sidebar-link ${currentView === 'posted-job' ? 'active' : ''}`} onClick={() => handleViewChange('posted-job')}>Posted Job</button></li>
                    <li style={{ marginTop: 'auto', paddingTop: '20px' }}><button type="button" className="signout-btn" style={{ width: '100%' }} onClick={handleSignout}>Sign Out</button></li>
                </ul>
            </div>

            <div className="column column-center">
                {error && <p className="error">{error}</p>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {currentView === 'overview' && !error && (
                    <div className="profile-content">
                        <div className="postjob-header">
                            <h3>Posted Jobs</h3>
                        </div>

                        {loading ? (
                            <p className="loading">Loading jobs...</p>
                        ) : jobs.length === 0 ? (
                            <div className="no-jobs">
                                <h4>No jobs posted yet</h4>
                                <p>Start by posting your first job opening.</p>
                                <button className="post-first-job-btn" onClick={() => handleViewChange('post-job')}>
                                    Post a Job
                                </button>
                            </div>
                        ) : (
                            <div className="jobs-list">
                                {jobs.map(job => (
                                    <div key={job.id} className="job-card" onClick={() => handleJobClick(job)}>
                                        <div className="job-header">
                                            <h4>{job.title}</h4>
                                            <span className="job-status">{job.status || 'Active'}</span>
                                        </div>
                                        <div className="job-details">
                                            <p><strong>Company:</strong> {job.company}</p>
                                            <p><strong>Location:</strong> {job.location}</p>
                                            <p><strong>Type:</strong> {job.jobtype}</p>
                                            <p><strong>Applicants:</strong> {job.applicantCount || 0}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedJob && !selectedApplicant && (
                    <div className="profile-content">
                        <div className="postjob-header">
                            <h3>{selectedJob.title} - Applicants</h3>
                            <button className="back-to-jobs-btn" onClick={() => setSelectedJob(null)}>← Back to Jobs</button>
                        </div>

                        {applicants.length === 0 ? (
                            <div className="no-applicants">
                                <h4>No applicants yet</h4>
                                <p>Applicants will appear here once they apply for this position.</p>
                            </div>
                        ) : (
                            <div className="applicants-list">
                                {applicants.map(applicant => (
                                    <div key={applicant.id} className="applicant-card" onClick={() => handleApplicantClick(applicant)}>
                                        <div className="applicant-header">
                                            <h4>{applicant.fullname}</h4>
                                            <span className="application-date">Applied: {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="applicant-details">
                                            <p><strong>Email:</strong> {applicant.email}</p>
                                            <p><strong>Phone:</strong> {applicant.phonenumber}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedApplicant && (
                    <div className="profile-content">
                        <div className="postjob-header">
                            <h3>Applicant Profile</h3>
                            <button className="back-to-applicants-btn" onClick={() => setSelectedApplicant(null)}>← Back to Applicants</button>
                        </div>

                        <div className="applicant-profile">
                            <div className="profile-section">
                                <h3>Contact Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Full Name:</span>
                                        <span className="value">{selectedApplicant.fullname}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Email:</span>
                                        <span className="value">{selectedApplicant.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Phone:</span>
                                        <span className="value">{selectedApplicant.phonenumber}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedApplicant.education && (
                                <div className="profile-section">
                                    <h3>Education</h3>
                                    <p>{selectedApplicant.education}</p>
                                </div>
                            )}

                            {selectedApplicant.experience && (
                                <div className="profile-section">
                                    <h3>Experience</h3>
                                    <p>{selectedApplicant.experience}</p>
                                </div>
                            )}

                            {selectedApplicant.skills && (
                                <div className="profile-section">
                                    <h3>Skills</h3>
                                    <p>{selectedApplicant.skills}</p>
                                </div>
                            )}

                            {selectedApplicant.resume && selectedApplicant.resume.length > 0 && (
                                <div className="profile-section">
                                    <h3>Resume/Documents</h3>
                                    <div className="resume-list">
                                        {selectedApplicant.resume.map((doc, index) => (
                                            <div key={index} className="resume-item">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    {doc.filename || `Document ${index + 1}`}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentView === 'post-job' && !error && (
                    <div className="profile-content">
                        {successMessage && <div className="success-message">{successMessage}</div>}
                        <div className="postjob-header">
                            <h3>Post a New Job</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="post-job-form">
                            <div className="form-group">
                                <label>Job Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={inputData.title}
                                    onChange={handleChange}
                                    placeholder="Enter job title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={inputData.company}
                                    onChange={handleChange}
                                    placeholder="Enter company name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={inputData.location}
                                    onChange={handleChange}
                                    placeholder="Enter job location"
                                    required
                                />
                            </div>

                            <div className="info-grid">
                                <div className="form-group">
                                    <label>Job Type</label>
                                    <select
                                        name="jobtype"
                                        value={inputData.jobtype}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select job type</option>
                                        <option value="full-time">Full Time</option>
                                        <option value="part-time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="freelance">Freelance</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Experience Level</label>
                                    <select
                                        name="experience"
                                        value={inputData.experience}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select experience</option>
                                        <option value="entry">Entry Level</option>
                                        <option value="mid">Mid Level</option>
                                        <option value="senior">Senior Level</option>
                                        <option value="executive">Executive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="form-group">
                                    <label>Salary Range</label>
                                    <input
                                        type="text"
                                        name="salary"
                                        value={inputData.salary}
                                        onChange={handleChange}
                                        placeholder="e.g., $50,000 - $70,000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Position</label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={inputData.position}
                                        onChange={handleChange}
                                        placeholder="e.g., Software Engineer"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Job Description</label>
                                <textarea
                                    name="description"
                                    value={inputData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the job responsibilities, requirements, and benefits"
                                    rows="6"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="save-btn"
                                >
                                    Post Job
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

        </div>
    )
}

export default Postjob