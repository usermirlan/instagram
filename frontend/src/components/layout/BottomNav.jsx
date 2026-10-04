import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiPlusSquare, FiMessageSquare, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './BottomNav.css';

const BottomNav = ({ onOpenCreatePost }) => {
  const { user } = useAuth();
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchChatCount = async () => {
      try {
        const res = await api.get('/chat/unread-count/');
        setUnreadChat(res.data.unread_count || 0);
      } catch {
        // ignore
      }
    };
    fetchChatCount();
    const timer = setInterval(fetchChatCount, 6000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FiHome className="bottom-nav-icon" />
      </NavLink>

      <NavLink to="/search" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FiSearch className="bottom-nav-icon" />
      </NavLink>

      <button className="bottom-nav-create-btn" onClick={onOpenCreatePost} type="button" aria-label="Create Post">
        <FiPlusSquare className="bottom-nav-icon" />
      </button>

      <NavLink to="/chat" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div className="bottom-icon-wrap">
          <FiMessageSquare className="bottom-nav-icon" />
          {unreadChat > 0 && <span className="bottom-badge-dot">{unreadChat}</span>}
        </div>
      </NavLink>

      <NavLink to={`/profile/${user?.username}`} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        {user?.profile?.avatar ? (
          <img src={user.profile.avatar} alt="Me" className="bottom-avatar" />
        ) : (
          <div className="bottom-avatar-placeholder">
            {user?.username ? user.username.charAt(0).toUpperCase() : <FiUser />}
          </div>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomNav;
