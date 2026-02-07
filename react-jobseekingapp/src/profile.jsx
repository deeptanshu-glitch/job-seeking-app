import React, { useEffect, useState } from "react";
import "./profile.css";
import CollapsibleExample from "./navafter";
import ProfileHeader from "./profileheader";
import API from "./api/auth";


function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        fullname: "",
        email: "",
        phonenumber: "",
        image: "",
        education: "",
        experience: ""
    });
    const [imagePreview, setImagePreview] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                console.log("Fetching profile data...");
                const response = await API.get("/dashboard");
                console.log("Profile response:", response.data);
                setProfileData(response.data.user);
                setEditData(response.data.user);
                setImagePreview(response.data.user.image || "");
                setLoading(false);
            } catch (err) {
                console.error("Profile fetch error:", err.response?.data || err.message);
                setError("Failed to load profile data: " + (err.response?.data?.error || err.message));
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // accept only jpg/jpeg
            if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
                alert('Please select a JPG/JPEG image');
                return;
            }

            // create object URL for preview and keep file for upload
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setEditData(prev => ({
                ...prev,
                imageFile: file
            }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('fullname', editData.fullname || '');
            formData.append('email', editData.email || '');
            formData.append('phonenumber', editData.phonenumber || '');
            formData.append('education', editData.education || '');
            formData.append('experience', editData.experience || '');
            if (editData.imageFile) {
                formData.append('image', editData.imageFile);
            }

            const response = await API.post('/update-profile', formData);
            setProfileData(response.data.user);
            setEditData(response.data.user);
            setImagePreview(response.data.user.image || '');
            setIsEditing(false);
            setSaving(false);
        } catch (err) {
            setError('Failed to save profile');
            setSaving(false);
            console.error(err);
        }
    };

    const handleShare = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            alert('Profile URL copied to clipboard');
        } catch (e) {
            alert('Unable to copy URL' + e);
        }
    };

    const handleDownloadCV = () => {
        const data = profileData || editData;
        const content = `Name: ${data.fullname || ''}\nEmail: ${data.email || ''}\nPhone: ${data.phonenumber || ''}\n\nEducation:\n${data.education || ''}\n\nExperience:\n${data.experience || ''}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(data.fullname || 'profile').replace(/\s+/g, '_')}_CV.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const computeCompleteness = (data) => {
        if (!data) return 0;
        const fields = ["fullname", "email", "phonenumber", "image", "education", "experience"];
        let filled = 0;
        fields.forEach(f => {
            const val = data[f];
            if (val && String(val).trim() !== "") filled++;
        });
        return Math.round((filled / fields.length) * 100);
    };

    const recentActivities = (data) => {
        if (!data) return [];
        const list = [];
        const now = new Date();
        const date = now.toLocaleDateString();
        if (data.experience && String(data.experience).trim() !== "") list.push({ text: "Updated experience", time: date });
        if (data.education && String(data.education).trim() !== "") list.push({ text: "Updated education", time: date });
        if (data.image) list.push({ text: "Changed profile photo", time: date });
        if (data.fullname) list.push({ text: "Updated name", time: date });
        return list.slice(0, 5);
    };

    const completeness = profileData ? computeCompleteness(profileData) : 0;
    const activities = profileData ? recentActivities(profileData) : [];

   return (
    <div className="profile-container">
        <div className="column column-left">
            <h3>Quick Links</h3>
            <ul className="sidebar-links">
                <li><a href="#overview">Overview</a></li>
                <li><a href="#experience">Experience</a></li>
                <li><a href="#education">Education</a></li>
                <li><a href="#edit">Edit Profile</a></li>
            </ul>
        </div>
        
        <div className="column column-center">
            {loading && <p className="loading">Loading profile...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && !profileData && <p className="error">No profile data available</p>}
            {profileData && (
                <div className="profile-content">
                    <div className="profile-header">
                        <div className={isEditing ? "profile-image-edit-mode" : "profile-image"}>
                            {isEditing ? (
                                <>
                                    <img src={imagePreview || "https://via.placeholder.com/150"} alt={editData.fullname} />
                                    <label className="image-upload-label">
                                        📷
                                        <input 
                                            type="file" 
                                            name="image"
                                            accept=".jpg,.jpeg"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </>
                            ) : (
                                <img src={profileData.image || "https://via.placeholder.com/150"} alt={profileData.fullname} />
                            )}
                        </div>
                        <div className="profile-info">
                            {isEditing ? (
                                <>
                                    <input 
                                        type="text" 
                                        name="fullname"
                                        value={editData.fullname}
                                        onChange={handleEditChange}
                                        className="profile-name-input"
                                    />
                                    <p className="username">@{editData.username || "N/A"}</p>
                                </>
                            ) : (
                                <>
                                    <h1>{profileData.fullname || "N/A"}</h1>
                                    <p className="username">@{profileData.username || "N/A"}</p>
                                </>
                            )}
                        </div>
                        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? "Cancel" : "✏️ Edit"}
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="edit-form">
                            <h3>Edit Profile Information</h3>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="tel" 
                                    name="phonenumber"
                                    value={editData.phonenumber}
                                    onChange={handleEditChange}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={editData.email}
                                    onChange={handleEditChange}
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Education</label>
                                <textarea 
                                    name="education"
                                    value={editData.education}
                                    onChange={handleEditChange}
                                    placeholder="Enter your education details"
                                    rows="4"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Experience</label>
                                <textarea 
                                    name="experience"
                                    value={editData.experience}
                                    onChange={handleEditChange}
                                    placeholder="Enter your work experience"
                                    rows="4"
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button 
                                    className="save-btn" 
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button 
                                    className="cancel-btn" 
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="profile-section" id="overview">
                                <h3>Contact Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Full Name:</span>
                                        <span className="value">{profileData.fullname || "N/A"}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Phone:</span>
                                        <span className="value">{profileData.phonenumber || "N/A"}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Email:</span>
                                        <span className="value">{profileData.email || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section" id="experience">
                                <h3>Experience</h3>
                                <p>{profileData.experience || "No experience added yet"}</p>
                            </div>

                            <div className="profile-section" id="education">
                                <h3>Education</h3>
                                <p>{profileData.education || "No education details added yet"}</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
        
        <div className="column column-right">
            <div className="right-card">
                <h3>Profile Snapshot</h3>
                <div className="progress-row">
                    <div className="progress-label">Completeness</div>
                    <div className="progress">
                        <div className="progress-bar" style={{ width: `${completeness}%` }}></div>
                    </div>
                    <div className="progress-percent">{completeness}%</div>
                </div>
                <div className="badges">
                    <span className="badge">Verified</span>
                    {profileData && profileData.education && <span className="badge">Educated</span>}
                    {profileData && profileData.experience && <span className="badge">Experienced</span>}
                </div>
            </div>

            <div className="right-card activity-card">
                <h4>Recent Activity</h4>
                <ul className="activity-list">
                    {activities.length === 0 ? (
                        <li className="muted">No recent activity</li>
                    ) : (
                        activities.map((a, i) => (
                            <li key={i}>
                                <div className="activity-title">{a.text}</div>
                                <div className="activity-time">{a.time}</div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <div className="right-card cta-card">
                <h4>Quick Actions</h4>
                <button className="primary-action" onClick={handleShare}>Share Profile</button>
                <button className="secondary-action" onClick={handleDownloadCV}>Download CV</button>
            </div>
        </div>
        
    </div>
   )

}
export default Profile ;
