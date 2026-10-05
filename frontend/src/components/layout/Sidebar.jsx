import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiSearch, 
  FiCompass,
  FiFilm,
  FiPlusSquare, 
  FiMessageSquare, 
  FiBell, 
  FiUser, 
  FiLogOut 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Sidebar.css';

const Sidebar = ({ onOpenCreatePost }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadNotif, setUnreadNotif] = useState(0);

  const fetchUnreadCounts = async () => {
    if (!user) return;
    try {
      const [chatRes, notifRes] = await Promise.all([
        api.get('/chat/unread-count/').catch(() => ({ data: { unread_count: 0 } })),
        api.get('/notifications/unread-count/').catch(() => ({ data: { unread_count: 0 } })),
      ]);
      setUnreadChat(chatRes.data.unread_count || 0);
      setUnreadNotif(notifRes.data.unread_count || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCounts();
    const timer = setInterval(fetchUnreadCounts, 6000);
    return () => clearInterval(timer);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Башкы бет', icon: FiHome },
    { to: '/search', label: 'Издөө', icon: FiSearch },
    { to: '/explore', label: 'Explore', icon: FiCompass },
    { to: '/reels', label: 'Reels', icon: FiFilm },
    { to: '/chat', label: 'Кабарлар', icon: FiMessageSquare, badge: unreadChat },
    { to: '/notifications', label: 'Билдирүүлөр', icon: FiBell, badge: unreadNotif },
    { to: `/profile/${user?.username}`, label: 'Профиль', icon: FiUser },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo">
          <span className="logo-badge">M</span>
          <span className="logo-text">Miko<span className="logo-accent">Social</span></span>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-wrapper">
                <Icon className="nav-icon" />
                {item.badge > 0 && <span className="sidebar-badge-dot">{item.badge}</span>}
              </div>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}

        <button 
          className="create-post-btn" 
          onClick={onOpenCreatePost}
          type="button"
        >
          <FiPlusSquare className="nav-icon" />
          <span>Жаңы Пост</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <NavLink to={`/profile/${user?.username}`} className="user-profile-summary">
          {user?.profile?.avatar ? (
            <img src={user.profile.avatar} alt={user.username} className="user-avatar" />
          ) : (
            <div className="avatar-placeholder small">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="user-info">
            <span className="user-name">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </span>
            <span className="user-handle">@{user?.username}</span>
          </div>
        </NavLink>

        <button 
          onClick={handleLogout} 
          className="logout-btn" 
          title="Чыгуу"
          aria-label="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
