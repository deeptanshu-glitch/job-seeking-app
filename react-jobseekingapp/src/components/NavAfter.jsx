import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import { markNotificationsAsRead } from "../api/dashboard";
import "./NavAfter.css";

const timeAgo = (dateStr) => {
  if (!dateStr) return "Just now";
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return past.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

function NavAfter() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const userCookie = Cookies.get("user");
  const user = userCookie ? JSON.parse(userCookie) : null;
  const role = user?.role || 'job seeker';

  useEffect(() => {
    try {
      const parsedUser = userCookie ? JSON.parse(userCookie) : null;
      setNotifications(parsedUser?.notifications || []);
    } catch (error) {
      console.error("Failed to parse user cookie", error);
    }
  }, [userCookie]);

  const unreadCount = (notifications || []).filter((notification) => !notification.read).length;

  const handleSignout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    navigate("/");
  };

  const handleNotificationUpdate = async (ids = []) => {
    if (isUpdatingNotifications) return;

    try {
      setIsUpdatingNotifications(true);
      const res = await markNotificationsAsRead(ids);
      const nextNotifications = res.data?.notifications || [];
      setNotifications(nextNotifications);

      const storedUser = Cookies.get("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        Cookies.set("user", JSON.stringify({ ...parsedUser, notifications: nextNotifications }), { expires: 7 });
      }
    } catch (error) {
      console.error("Failed to update notifications", error);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  return (
    <nav className="app-navbar">
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-brand">
          <span className="nav-brand-icon">🔍</span>
          <span>Job Finder</span>
        </Link>
        <div className="nav-center">
          {role !== 'recruiter' && (
            <div className="nav-search">
              <span className="nav-search-icon">🔍</span>
              <input type="text" placeholder="Search for jobs..." />
            </div>
          )}
        </div>
        <div className="nav-right">
          <Link to="/dashboard" className="nav-link">Home</Link>
          <div className="nav-notification-wrapper">
            <button
              type="button"
              className="nav-notification-btn"
              aria-label="Notifications"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <span className="nav-notification-icon">🔔</span>
              {unreadCount > 0 && <span className="nav-notification-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <strong>Notifications</strong>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="dropdown-mark-all"
                      onClick={() => handleNotificationUpdate()}
                      disabled={isUpdatingNotifications}
                    >
                      {isUpdatingNotifications ? "Updating..." : "Mark all read"}
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="notification-dropdown-empty">You’re all caught up.</div>
                ) : (
                  <div className="notification-dropdown-list">
                    {notifications.slice(0, 6).map((notification) => (
                      <div key={notification._id || notification.createdAt} className={`notification-dropdown-item ${notification.read ? "" : "unread"}`}>
                        <div className="notification-dropdown-content">
                          <div className="notification-dropdown-message">{notification.message}</div>
                          <div className="notification-dropdown-time">{timeAgo(notification.createdAt)}</div>
                        </div>
                        {!notification.read && (
                          <button
                            type="button"
                            className="notification-dropdown-check"
                            onClick={() => handleNotificationUpdate([notification._id])}
                            disabled={isUpdatingNotifications}
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="notification-dropdown-footer">
                  <Link to="/dashboard#notifications" onClick={() => setShowNotifications(false)}>
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          {role === 'recruiter' ? (
            <Link to="/post" className="nav-cta-btn">Recruiter Dashboard</Link>
          ) : (
            <Link to="/profile" className="nav-cta-btn">Profile</Link>
          )}
          <button onClick={handleSignout} className="nav-signout-btn">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavAfter;