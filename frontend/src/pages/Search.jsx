import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiUser, FiGrid, FiHeart, FiMessageCircle, FiX, FiUsers } from 'react-icons/fi';
import api from '../api/axios';
import PostCard from '../components/post/PostCard';
import './Search.css';

const Search = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'posts'
  const [searchTerm, setSearchTerm] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch users (either search query or suggested users)
  const fetchUsers = async (query = '') => {
    try {
      setIsLoading(true);
      const url = query.trim()
        ? `/users/search/?q=${encodeURIComponent(query.trim())}`
        : `/users/search/`;
      const res = await api.get(url);
      setUserResults(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Fetch users error', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch posts (either explore or search by caption)
  const fetchPosts = async (query = '') => {
    try {
      setIsLoading(true);
      const url = query.trim()
        ? `/posts/?q=${encodeURIComponent(query.trim())}`
        : `/posts/`;
      const res = await api.get(url);
      setPostResults(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Fetch posts error', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(searchTerm);
    } else {
      fetchPosts(searchTerm);
    }
  }, [activeTab]);

  // Debounced search on term change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'users') {
        fetchUsers(searchTerm);
      } else {
        fetchPosts(searchTerm);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="search-page-container">
      {/* Search Input Bar */}
      <div className="search-input-wrapper glass-card">
        <FiSearch className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            activeTab === 'users'
              ? 'Колдонуучуларды издөө (логин же аты)...'
              : 'Постторду же темаларды издөө...'
          }
          className="search-input"
          autoFocus
        />
        {searchTerm && (
          <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
            <FiX />
          </button>
        )}
        {isLoading && <div className="search-loader" />}
      </div>

      {/* Tabs Row */}
      <div className="search-tabs-row">
        <button
          className={`search-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers /> Колдонуучулар
        </button>
        <button
          className={`search-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FiGrid /> Посттор / Explore
        </button>
      </div>

      {/* Tab Content: Users */}
      {activeTab === 'users' && (
        <div className="search-results-section">
          {!searchTerm.trim() && (
            <div className="search-section-header">
              <span className="section-title">Сунушталган колдонуучулар</span>
            </div>
          )}

          <div className="search-results-list">
            {userResults.length > 0 ? (
              userResults.map((u) => (
                <Link to={`/profile/${u.username}`} key={u.id} className="search-user-card glass-card">
                  {u.profile?.avatar ? (
                    <img src={u.profile.avatar} alt={u.username} className="search-avatar" />
                  ) : (
                    <div className="search-avatar-placeholder">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="search-user-details">
                    <span className="search-name">
                      {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                    </span>
                    <span className="search-username">@{u.username}</span>
                    {u.profile?.bio && <p className="search-bio">{u.profile.bio}</p>}
                  </div>
                </Link>
              ))
            ) : !isLoading ? (
              <div className="no-results glass-card">
                <FiUser className="no-results-icon" />
                <p>{searchTerm.trim() ? `"${searchTerm}" боюнча эч ким табылган жок.` : 'Азырынча колдонуучулар жок.'}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Tab Content: Posts / Explore Grid */}
      {activeTab === 'posts' && (
        <div className="search-results-section">
          {!searchTerm.trim() && (
            <div className="search-section-header">
              <span className="section-title">Explore — Кызыктуу посттор</span>
            </div>
          )}

          {postResults.length > 0 ? (
            <div className="explore-posts-grid">
              {postResults.map((p) => (
                <div
                  key={p.id}
                  className="explore-thumbnail-item"
                  onClick={() => setSelectedPost(p)}
                >
                  <img src={p.image} alt={p.caption || 'Explore post'} className="explore-thumb-img" />
                  <div className="explore-thumb-overlay">
                    <span className="explore-stat"><FiHeart /> {p.likes_count}</span>
                    <span className="explore-stat"><FiMessageCircle /> {p.comments_count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoading ? (
            <div className="no-results glass-card">
              <FiGrid className="no-results-icon" />
              <p>{searchTerm.trim() ? `"${searchTerm}" боюнча пост табылган жок.` : 'Азырынча эч кандай пост жарыялана элек.'}</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Selected Post Modal Preview */}
      {selectedPost && (
        <div className="post-modal-backdrop" onClick={() => setSelectedPost(null)}>
          <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="post-modal-close" onClick={() => setSelectedPost(null)}>
              <FiX />
            </button>
            <PostCard
              post={selectedPost}
              onPostDeleted={(id) => {
                setPostResults((prev) => prev.filter((p) => p.id !== id));
                setSelectedPost(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
