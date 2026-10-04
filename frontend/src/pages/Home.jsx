import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FiPlusSquare, FiCompass, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/post/PostCard';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const { openCreatePost, newlyCreatedPost } = useOutletContext() || {};

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/feed/');
      const data = res.data?.results || res.data || [];
      setPosts(data);
    } catch (err) {
      console.error('Failed to load feed', err);
      setError('Постторду жүктөөдө ката чыкты.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // Эгер жаңы пост жарыяланса, дароо лентанын башына кошуу
  useEffect(() => {
    if (newlyCreatedPost) {
      setPosts((prev) => [newlyCreatedPost, ...prev]);
    }
  }, [newlyCreatedPost]);

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <div className="home-feed-container">
      {/* Stories / Quick Statuses Bar */}
      <div className="stories-bar glass-card">
        <div className="story-item active-user" onClick={openCreatePost}>
          <div className="story-avatar-wrapper">
            {user?.profile?.avatar ? (
              <img src={user.profile.avatar} alt="Me" className="story-avatar" />
            ) : (
              <div className="story-avatar placeholder">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="story-plus-badge">+</span>
          </div>
          <span className="story-username">Жаңы пост</span>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="feed-posts-wrapper">
        {loading ? (
          <div className="feed-loading glass-card">
            <div className="spinner" />
            <p>Лента жүктөлүүдө...</p>
          </div>
        ) : error ? (
          <div className="alert-error" style={{ textAlign: 'center' }}>
            <p>{error}</p>
            <button onClick={fetchFeed} className="btn-secondary" style={{ marginTop: '10px' }}>
              <FiRefreshCw /> Кайра аракет кылуу
            </button>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostDeleted={handlePostDeleted} 
            />
          ))
        ) : (
          <div className="empty-feed-card glass-card">
            <div className="empty-icon-wrap">
              <FiCompass />
            </div>
            <h3>Лентаңыз азырынча бош</h3>
            <p>
              Досторуңузду таап жазылыңыз (Follow) же биринчи сонун постуңузду бөлүшүңүз!
            </p>
            <div className="empty-feed-actions">
              <button onClick={openCreatePost} className="btn-primary">
                <FiPlusSquare /> Пост чыгаруу
              </button>
              <Link to="/search" className="btn-secondary">
                Колдонуучуларды издөө
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
