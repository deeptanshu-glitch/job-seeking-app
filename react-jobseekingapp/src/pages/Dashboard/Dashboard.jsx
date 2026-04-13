import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CollapsibleExample from "../../components/NavAfter";
import { getSeekerDashboard } from "../../api/dashboard";
import "./Dashboard.css";

// ── Helpers ──────────────────────────────────────────
const timeAgo = (dateStr) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return past.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const jobTypeEmoji = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("remote")) return "🌐";
  if (t.includes("part")) return "⏰";
  if (t.includes("contract")) return "📝";
  return "🏢";
};

const statusClass = (s) => {
  if (s === "accepted") return "status-badge status-accepted";
  if (s === "rejected") return "status-badge status-rejected";
  return "status-badge status-pending";
};

const statusLabel = (s) => {
  if (s === "accepted") return "✅ Accepted";
  if (s === "rejected") return "❌ Rejected";
  return "⏳ Pending";
};

// ── Skeleton Loader ──────────────────────────────────
function SkeletonCard() {
  return (
    <div className="dash-card" style={{ marginBottom: 0 }}>
      <div className="skeleton skel-line short" />
      <div className="skeleton skel-line medium" />
      <div className="skeleton skel-line full" />
      <div className="skeleton skel-line full" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────
function Dash() {
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    const cookieUser = userCookie ? JSON.parse(userCookie) : null;

    if (cookieUser?.role === "recruiter") {
      navigate("/post");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await getSeekerDashboard();
        setDashData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="seeker-dashboard">
        <CollapsibleExample />
        <div className="dash-hero" style={{ minHeight: 140 }} />
        <div className="dash-body" style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 40 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const { user, profileCompletion, applications = [], latestJobs = [] } = dashData || {};

  const pendingCount   = applications.filter((a) => a.status === "pending").length;
  const acceptedCount  = applications.filter((a) => a.status === "accepted").length;
  const rejectedCount  = applications.filter((a) => a.status === "rejected").length;
  const profileComplete = profileCompletion >= 100;

  const filteredJobs = latestJobs.filter(j => 
    !searchQuery || 
    (j.title && j.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (j.companyName && j.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (j.location && j.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="seeker-dashboard">
      {/* ── Navbar ── */}
      <CollapsibleExample />

      {/* ── Hero Greeting ── */}
      <div className="dash-hero">
        <div className="hero-inner">
          <div className="hero-text">
            <p className="greeting-label">Job Seeker Dashboard</p>
            <h1>Hi, {user?.fullname?.split(" ")[0] || user?.username || "there"} 👋</h1>
            <p className="hero-subtitle">
              {profileComplete
                ? "Your profile is complete — you're ready to land your dream job!"
                : `Complete your profile to get ${100 - profileCompletion}% more visibility to recruiters.`}
            </p>
          </div>

          {/* Avatar */}
          {user?.image ? (
            <img
              src={user.image}
              alt="Profile"
              className="hero-avatar"
            />
          ) : (
            <div className="hero-avatar-placeholder">
              {initials(user?.fullname || user?.username || "U")}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="dash-body">

        {/* ── Profile Completion Banner ── */}
        {!profileComplete ? (
          <div className="profile-complete-banner">
            <div className="banner-left">
              <span className="banner-icon">⚡</span>
              <div className="banner-text">
                <h3>Complete Your Profile</h3>
                <p>
                  {profileCompletion < 50
                    ? "Your profile is just getting started — add more info to stand out!"
                    : "Almost there! A fully filled profile gets 3× more recruiter views."}
                </p>
              </div>
            </div>

            <div className="progress-wrap">
              <div className="progress-bar-outer">
                <div
                  className="progress-bar-inner"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <div className="progress-label">{profileCompletion}% Complete</div>
            </div>

            <Link to="/profile" className="btn-complete-profile">
              Complete Profile →
            </Link>
          </div>
        ) : (
          <div className="profile-done-banner">
            <span>🎉</span>
            Profile 100% complete — recruiters can find you easily!
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Total Applied</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{pendingCount}</div>
            <div className="stat-label">Under Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{acceptedCount}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{rejectedCount}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{latestJobs.length}</div>
            <div className="stat-label">New Jobs Today</div>
          </div>
        </div>

        {/* ── Applied Jobs ── */}
        <div className="dash-card" style={{ marginBottom: 24 }}>
          <h2 className="section-heading">
            <span className="section-icon">📋</span>
            Applied Jobs
            <span className="section-count">{applications.length} total</span>
          </h2>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h4>No applications yet</h4>
              <p>Browse the latest jobs below and start applying!</p>
            </div>
          ) : (
            <div className="applied-list">
              {applications.map((app) => (
                <div key={app._id} className="applied-item">
                  <div className="applied-item-left">
                    <div className="job-logo-circle">
                      {jobTypeEmoji(app.job?.jobtype)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="applied-job-title">
                        {app.job?.title || "Job Title Unavailable"}
                      </div>
                      <div className="applied-job-company">
                        🏢 {app.job?.companyName || "—"}
                      </div>
                      <div className="applied-job-meta">
                        {app.job?.location && (
                          <span className="meta-pill">📍 {app.job.location}</span>
                        )}
                        {app.job?.jobtype && (
                          <span className="meta-pill">{app.job.jobtype}</span>
                        )}
                        {app.job?.salary && (
                          <span className="meta-pill">💰 {app.job.salary}</span>
                        )}
                      </div>
                      <div className="applied-date">
                        Applied {timeAgo(app.createdAt)}
                      </div>
                    </div>
                  </div>

                  <span className={statusClass(app.status)}>
                    {statusLabel(app.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Latest Job Listings ── */}
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="section-heading" style={{ margin: 0 }}>
              <span className="section-icon">🚀</span>
              Latest Openings
              <span className="section-count">{filteredJobs.length} active</span>
            </h2>
            
            <input 
              type="text" 
              placeholder="🔍 Search jobs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                minWidth: '250px',
                fontFamily: 'Inter',
                fontSize: '14px'
              }}
            />
          </div>

          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No jobs found</h4>
              <p>Try adjusting your search or check back tomorrow.</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <Link key={job._id} to={`/job/${job._id}`} className="job-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="job-card-header">
                    <div>
                      <div className="job-card-title">{job.title}</div>
                      <div className="job-card-company">🏢 {job.companyName}</div>
                    </div>
                    {job.jobtype && (
                      <span className="job-type-badge">{job.jobtype}</span>
                    )}
                  </div>

                  <div className="job-card-details">
                    {job.location && (
                      <div className="job-detail-row">
                        <span className="d-icon">📍</span>
                        {job.location}
                      </div>
                    )}
                    {job.experience && (
                      <div className="job-detail-row">
                        <span className="d-icon">💼</span>
                        {job.experience} experience
                      </div>
                    )}
                  </div>

                  <div className="job-card-footer" style={{ borderTop: 'none', paddingTop: '16px', marginTop: 'auto' }}>
                    <span className="job-salary">
                      {job.salary && job.salary !== "Not specified"
                        ? `💰 ${job.salary}`
                        : "Salary N/A"}
                    </span>
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '13px'
                    }}>
                      Apply →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dash;
