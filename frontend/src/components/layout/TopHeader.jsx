import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiBell, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './TopHeader.css';

const TopHeader = () => {
  const { user, logout } = useAuth();
  const [unreadNotif, setUnreadNotif] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count/');
        setUnreadNotif(res.data.unread_count || 0);
      } catch {
        // ignore
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 6000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="top-header">
      <NavLink to="/" className="top-logo">
        <span className="logo-badge mini">M</span>
        <span className="logo-text mini">Miko<span className="logo-accent">Social</span></span>
      </NavLink>

      <div className="top-actions">
        <NavLink to="/notifications" className="top-icon-btn" aria-label="Notifications">
          <FiBell />
          {unreadNotif > 0 && <span className="top-badge-dot">{unreadNotif}</span>}
        </NavLink>
        <button onClick={logout} className="top-icon-btn logout" aria-label="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
