import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiHeart, FiMessageCircle, FiUserPlus, FiMail, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/');
      const items = res.data?.results || res.data || [];
      setNotifications(items);
    } catch (err) {
      console.error('Fetch notifications error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await api.post('/notifications/read-all/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark all read error', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Mark read error', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FiHeart className="notif-badge-icon like" />;
      case 'comment':
        return <FiMessageCircle className="notif-badge-icon comment" />;
      case 'follow':
        return <FiUserPlus className="notif-badge-icon follow" />;
      case 'message':
        return <FiMail className="notif-badge-icon message" />;
      default:
        return <FiBell className="notif-badge-icon" />;
    }
  };

  const getNotificationText = (n) => {
    switch (n.notification_type) {
      case 'like':
        return 'постуңузга лайк басты';
      case 'comment':
        return 'постуңузга комментарий калтырды';
      case 'follow':
        return 'сизге жазылды';
      case 'message':
        return 'сизге билдирүү жөнөттү';
      default:
        return 'аракет жасады';
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return 'азыр эле';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} мүнөт мурун`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} саат мурун`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} күн мурун`;
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header glass-card">
        <div className="header-left">
          <FiBell className="header-icon" />
          <h2>Билдирүүлөр</h2>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="mark-all-read-btn"
          >
            <FiCheckCircle /> Баарын окулду кылуу
          </button>
        )}
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="notifications-loading glass-card">
            <div className="spinner mini" />
            <p>Жүктөлүүдө...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty glass-card">
            <FiBell className="empty-icon" />
            <h3>Азырынча билдирүүлөр жок</h3>
            <p>Жаңы жазылуучулар, лайктар жана комментарийлер ушул жерде көрүнөт.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-item glass-card ${!n.is_read ? 'unread' : ''}`}
              onClick={() => !n.is_read && handleMarkOneRead(n.id)}
            >
              <div className="notif-avatar-wrapper">
                <Link to={`/profile/${n.sender.username}`} onClick={(e) => e.stopPropagation()}>
                  {n.sender.avatar ? (
                    <img src={n.sender.avatar} alt={n.sender.username} className="notif-avatar" />
                  ) : (
                    <div className="notif-avatar placeholder">
                      {n.sender.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                {getNotificationIcon(n.notification_type)}
              </div>

              <div className="notif-content">
                <div className="notif-main-text">
                  <Link
                    to={`/profile/${n.sender.username}`}
                    className="notif-username"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{n.sender.username}
                  </Link>{' '}
                  <span className="notif-action-text">{getNotificationText(n)}</span>
                </div>
                <span className="notif-time">{formatTime(n.created_at)}</span>
              </div>

              {n.post_image && (
                <div className="notif-post-preview">
                  <img src={n.post_image} alt="Post preview" className="notif-thumb" />
                </div>
              )}

              {n.notification_type === 'message' && (
                <Link to="/chat" className="notif-action-link" onClick={(e) => e.stopPropagation()}>
                  Чатка өтүү
                </Link>
              )}

              {!n.is_read && <div className="unread-dot" title="Окула элек" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
