import React from "react";
import "./profileheader.css";

function ProfileHeader({ user }) {
  return (
    <div className="profile-header">

      
      <div className="cover-photo"></div>

      
      <div className="profile-info">

        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt="profile"
          className="profile-pic"
        />

        <div className="profile-text">
          <h2>{user.fullname}</h2>
          <p className="headline">{user.headline || "Open to work"}</p>
          <p className="location">
            {user.location || "India"} · {user.email}
          </p>
        </div>

      </div>

    </div>
  );
}

export default ProfileHeader;
