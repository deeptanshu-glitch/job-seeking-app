import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import API from "./api/auth";


function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [successMessage, setSuccessMessage] = useState(''); 
    const [editData, setEditData] = useState({
        fullname: "",
        email: "",
        phonenumber: "",
        image: "",
        education: [],
        experience: [],
        skills: [],
        links: [],
        resume: [],
        resumeFiles: []
    });
    const [resumeText, setResumeText] = useState('');
    const [editInputs, setEditInputs] = useState({ education: '', experience: '', skills: '', links: '' });
    const [imagePreview, setImagePreview] = useState("");
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    };

    const handleBack = () => {
        navigate(-1);
    };

    const overviewRef = useRef(null);
    const experienceRef = useRef(null);
    const educationRef = useRef(null);
    const resumeRef = useRef(null);
    const skillsRef = useRef(null);
    const linksRef = useRef(null);
    const editRef = useRef(null);

    const scrollToSection = (section) => {
        if (section === 'edit') {
            setIsEditing(true);
            setTimeout(() => {
                const el = editRef.current;
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (el) {
                    el.classList.add('blink');
                    setTimeout(() => el.classList.remove('blink'), 1200);
                }
            }, 120);
            return;
        }

        const map = { overview: overviewRef, experience: experienceRef, education: educationRef, skills: skillsRef, links: linksRef };
        const ref = map[section];
        if (ref?.current) {
            const el = ref.current;
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            el.classList.add('blink');
            setTimeout(() => el.classList.remove('blink'), 1200);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                console.log("Fetching profile data...");
                const response = await API.get("/dashboard");
                console.log("Profile response:", response.data);
                const user = response.data.user || {};
                setProfileData(user);
                const splitToArray = (val) => {
                    if (!val) return [];
                    return String(val).split(/\r?\n|,|;/).map(s=>s.trim()).filter(Boolean);
                };
                setEditData({
                    ...user,
                    education: splitToArray(user.education),
                    experience: splitToArray(user.experience),
                    skills: splitToArray(user.skills),
                    links: splitToArray(user.links),
                    resume: user.resume || []
                });
                setResumeText(user.resumeText || '');
                setImagePreview(user.image || "");
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
            if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
                alert('Please select a JPG/JPEG image');
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setEditData(prev => ({
                ...prev,
                imageFile: file
            }));
        }
    };

    const handleResumeChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const allowedExt = ['pdf','doc','docx'];
        for (const file of files) {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            if (!allowedExt.includes(ext)) {
                alert('Please select PDF or Word documents only');
                return;
            }
        }

        setEditData(prev => ({ ...prev, resumeFiles: [...(prev.resumeFiles || []), ...files] }));
    };

    const addItem = (field) => {
        const value = editInputs[field]?.trim();
        if (!value) return;
        setEditData(prev => ({ ...prev, [field]: [...(prev[field] || []), value] }));
        setEditInputs(prev => ({ ...prev, [field]: '' }));
    };

    const removeItem = (field, idx) => {
        setEditData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
    };

    const handleInputKey = (e, field) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addItem(field);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('fullname', editData.fullname || '');
            formData.append('email', editData.email || '');
            formData.append('phonenumber', editData.phonenumber || '');
            formData.append('education', Array.isArray(editData.education) ? editData.education.join('; ') : (editData.education || ''));
            formData.append('experience', Array.isArray(editData.experience) ? editData.experience.join('; ') : (editData.experience || ''));
            formData.append('skills', Array.isArray(editData.skills) ? editData.skills.join('; ') : (editData.skills || ''));
            formData.append('links', Array.isArray(editData.links) ? editData.links.join('; ') : (editData.links || ''));
            if (resumeText) {
                formData.append('resumeText', resumeText);
            }
            if (editData.imageFile) {
                formData.append('image', editData.imageFile);
            }
            if (editData.resumeFiles && editData.resumeFiles.length) {
                editData.resumeFiles.forEach(f => formData.append('resume', f));
            }

            console.log('Saving profile with data:', {
                fullname: editData.fullname,
                email: editData.email,
                phonenumber: editData.phonenumber,
                hasImage: !!editData.imageFile,
                hasResume: !!(editData.resumeFiles && editData.resumeFiles.length)
            });

            const response = await API.post('/update-profile', formData);
            console.log('Save response:', response.data);
            
            const user = response.data.user || {};
            setProfileData(user);
            const splitToArray = (val) => {
                if (!val) return [];
                return String(val).split(/\r?\n|,|;/).map(s=>s.trim()).filter(Boolean);
            };
            setEditData({
                ...user,
                education: splitToArray(user.education),
                experience: splitToArray(user.experience),
                skills: splitToArray(user.skills),
                links: splitToArray(user.links),
                resume: Array.isArray(user.resume) ? user.resume : [],
                resumeFiles: []
            });
            setResumeText(user.resumeText || '');
            setImagePreview(user.image || '');
            setIsEditing(false);
            setEditingSection(null);
            setSaving(false);
            setSuccessMessage('✓ Saved successfully!');
            setTimeout(() => setSuccessMessage(''), 2000);
        } catch (err) {
            console.error('Save error:', err.response?.data || err.message);
            setError('Failed to save profile: ' + (err.response?.data?.error || err.message));
            setSaving(false);
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

    const computeCompleteness = (data) => {
        if (!data) return 0;
        const fields = ["fullname", "email", "phonenumber", "image", "education", "experience","skills"];
        let filled = 0;
        fields.forEach(f => {
            const val = data[f];
            if (val && String(val).trim() !== "") filled++;
        });
        return Math.round((filled / fields.length) * 100);
    };

    const completeness = profileData ? computeCompleteness(profileData) : 0;
    
    
    return(
        <div className="profile-container">
        <div className="column column-left">
            <button onClick={handleBack} className="back-btn">← Back</button>
            <h3> Profile </h3>
            <ul className="sidebar-links">
                <li><button type="button" className="sidebar-link" onClick={()=>scrollToSection('overview')}>Overview</button></li>
                <li><button type="button" className="sidebar-link" onClick={()=>scrollToSection('experience')}>Experience</button></li>
                <li><button type="button" className="sidebar-link" onClick={()=>scrollToSection('education')}>Education</button></li>
                <li><button type="button" className="sidebar-link" onClick={()=>scrollToSection('skills')}>Skills</button></li>
                <li><button type="button" className="sidebar-link" onClick={()=>scrollToSection('links')}>Links</button></li>
                <li><button type="button" className="sidebar-link" onClick={()=>scrollToSection('edit')}>Edit Profile</button></li>
                <li><button type="button" className="sidebar-link" onClick={()=>scrollToSection('resume')}>Resume</button></li>
            </ul>
        </div>
        
        <div className="column column-center">
            {loading && <p className="loading">Loading profile...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && !profileData && <p className="error">No profile data available</p>}
            {profileData && (
                <div className="profile-content">
                    {successMessage && <div className="success-message">{successMessage}</div>}
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
                                <img src={profileData.image || "https://png.pngtree.com/png-vector/20210129/ourmid/pngtree-upload-avatar-by-default-png-image_2854358.jpg"} />
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
                            {isEditing ? "Cancel" : "✏️"}
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="edit-form" ref={editRef}>
                            <h3>Edit Contact Information</h3>

                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    name="fullname"
                                    value={editData.fullname}
                                    onChange={handleEditChange}
                                    placeholder="Enter your full name"
                                />
                            </div>

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
                            <div className="profile-section" id="overview" ref={overviewRef}>
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
{/* experience block  */}
                            <div className="profile-section" id="experience" ref={experienceRef}>
                                <div className="section-header">
                                    <h3>Experience</h3>
                                    <button type="button" className="section-edit-btn" onClick={() => {
                                        if (editingSection === 'experience') {
                                            handleSave();
                                        } else {
                                            setEditingSection('experience');
                                        }
                                    }}>
                                        {editingSection === 'experience' ? '✓' : '✏️'}
                                    </button>
                                </div>
                                {editingSection === 'experience' ? (
                                    <div className="section-edit">
                                        <div className="tag-input">
                                            <div className="tag-list">
                                                {(editData.experience || []).map((it, i) => (
                                                    <span className="tag" key={i}>
                                                        {it}
                                                        <button type="button" className="tag-remove" onClick={() => removeItem('experience', i)}>×</button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                value={editInputs.experience}
                                                onChange={(e)=>setEditInputs(prev=>({ ...prev, experience: e.target.value }))}
                                                onKeyDown={(e)=>handleInputKey(e,'experience')}
                                                placeholder="Add experience and press Enter"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    (editData.experience && editData.experience.length > 0) ? (
                                        <div className="item-blocks">
                                            {editData.experience.map((it, i) => (
                                                <div className="item-block" key={i}>{it}</div>
                                            ))}
                                        </div>
                                    ) : <p>No experience added yet</p>
                                )}
                            </div>

                            <div className="profile-section" id="education" ref={educationRef}>
                                <div className="section-header">
                                    <h3>Education</h3>
                                    <button type="button" className="section-edit-btn" onClick={() => {
                                        if (editingSection === 'education') {
                                            handleSave();
                                        } else {
                                            setEditingSection('education');
                                        }
                                    }}>
                                        {editingSection === 'education' ? '✓' : '✏️'}
                                    </button>
                                </div>
                                {editingSection === 'education' ? (
                                    <div className="section-edit">
                                        <div className="tag-input">
                                            <div className="tag-list">
                                                {(editData.education || []).map((it, i) => (
                                                    <span className="tag" key={i}>
                                                        {it}
                                                        <button type="button" className="tag-remove" onClick={() => removeItem('education', i)}>×</button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                value={editInputs.education}
                                                onChange={(e)=>setEditInputs(prev=>({ ...prev, education: e.target.value }))}
                                                onKeyDown={(e)=>handleInputKey(e,'education')}
                                                placeholder="Add education and press Enter"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    (editData.education && editData.education.length > 0) ? (
                                        <div className="item-blocks">
                                            {editData.education.map((it, i) => (
                                                <div className="item-block" key={i}>{it}</div>
                                            ))}
                                        </div>
                                    ) : <p>No education details added yet</p>
                                )}
                            </div>

                            <div className="profile-section" id="skills" ref={skillsRef}>
                                <div className="section-header">
                                    <h3>Skills</h3>
                                    <button type="button" className="section-edit-btn" onClick={() => {
                                        if (editingSection === 'skills') {
                                            handleSave();
                                        } else {
                                            setEditingSection('skills');
                                        }
                                    }}>
                                        {editingSection === 'skills' ? '✓' : '✏️'}
                                    </button>
                                </div>
                                {editingSection === 'skills' ? (
                                    <div className="section-edit">
                                        <div className="tag-input">
                                            <div className="tag-list">
                                                {(editData.skills || []).map((it, i) => (
                                                    <span className="tag" key={i}>
                                                        {it}
                                                        <button type="button" className="tag-remove" onClick={() => removeItem('skills', i)}>×</button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                value={editInputs.skills}
                                                onChange={(e)=>setEditInputs(prev=>({ ...prev, skills: e.target.value }))}
                                                onKeyDown={(e)=>handleInputKey(e,'skills')}
                                                placeholder="Add a skill and press Enter"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    (editData.skills && editData.skills.length > 0) ? (
                                        <div className="item-blocks">
                                            {editData.skills.map((it, i) => (
                                                <div className="item-block" key={i}>{it}</div>
                                            ))}
                                        </div>
                                    ) : <p>No skills added yet</p>
                                )}
                            </div>
{/* resume block  */}
                            <div className="profile-section" id="resume" ref={resumeRef}>
                                <div className="section-header">
                                    <h3>Resume</h3>
                                    <button type="button" className="section-edit-btn" onClick={() => {
                                        if (editingSection === 'resume') {
                                            handleSave();
                                        } else {
                                            setEditingSection('resume');
                                        }
                                    }}>
                                        {editingSection === 'resume' ? '✓' : '✏️'}
                                    </button>
                                </div>
                                {editingSection === 'resume' ? (
                                    <div className="section-edit">
                                        <div className="form-group">
                                            <label>Upload File(s)</label>
                                            {Array.isArray(profileData?.resume) && profileData.resume.length > 0 && (
                                                <div style={{marginBottom:8}}>
                                                    {profileData.resume.map((r, idx) => (
                                                        <div key={idx}>Existing: <a href={`${API.defaults.baseURL.replace('/api','')}${r}`} target="_blank" rel="noreferrer">{r.split('/').pop()}</a></div>
                                                    ))}
                                                </div>
                                            )}
                                            {(editData.resumeFiles || []).length > 0 && (
                                                <div style={{marginBottom:8}}>Selected: {(editData.resumeFiles || []).map((f,i) => (<div key={i}>{f.name}</div>))}</div>
                                            )}
                                            <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
                                        </div>
                                    </div>
                                ) : (
                                    ((Array.isArray(profileData.resume) && profileData.resume.length > 0) || resumeText) ? (
                                        <div>
                                            {Array.isArray(profileData.resume) && profileData.resume.map((r,i) => (
                                                <p key={i}><a href={`${API.defaults.baseURL.replace('/api','')}${r}`} target="_blank" rel="noreferrer">📄 {r.split('/').pop()}</a></p>
                                            ))}
                                            {resumeText && <p style={{whiteSpace:'pre-wrap'}}>{resumeText}</p>}
                                        </div>
                                    ) : (
                                        <p>No resume uploaded</p>
                                    )
                                )}
                            </div>

                            <div className="profile-section" id="links" ref={linksRef}>
                                <div className="section-header">
                                    <h3>Repository / Project Links</h3>
                                    <button type="button" className="section-edit-btn" onClick={() => {
                                        if (editingSection === 'links') {
                                            handleSave();
                                        } else {
                                            setEditingSection('links');
                                        }
                                    }}>
                                        {editingSection === 'links' ? '✓' : '✏️'}
                                    </button>
                                </div>
                                {editingSection === 'links' ? (
                                    <div className="section-edit">
                                        <div className="tag-input">
                                            <div className="tag-list">
                                                {(editData.links || []).map((it, i) => (
                                                    <span className="tag" key={i}>
                                                        {it}
                                                        <button type="button" className="tag-remove" onClick={() => removeItem('links', i)}>×</button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                value={editInputs.links}
                                                onChange={(e)=>setEditInputs(prev=>({ ...prev, links: e.target.value }))}
                                                onKeyDown={(e)=>handleInputKey(e,'links')}
                                                placeholder="Add link (e.g., https://github.com/username/repo) and press Enter"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    (editData.links && editData.links.length > 0) ? (
                                        <div className="item-blocks">
                                            {editData.links.map((it, i) => (
                                                <div className="item-block" key={i}>
                                                    <a href={it} target="_blank" rel="noreferrer">🔗 {it}</a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p>No links added yet</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
        
        <div className="column column-right">
            <div className="right-card">
                <h3>Profile Status</h3>
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
                    {profileData && profileData.skills && <span className="badge">Skilled</span>}
                </div>
            </div>

            <div className="right-card cta-card">
                <h4>Quick Actions</h4>
                <button className="primary-action" onClick={handleShare}>Share Profile</button>
            </div> 

            <div className="right-actions">
                <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
            </div> 
        </div>  
    </div>
   )

}
export default Profile ;
