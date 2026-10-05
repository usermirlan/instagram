import React, { useState, useEffect } from 'react';
import { FiCompass, FiHeart, FiMessageCircle, FiLayers, FiX } from 'react-icons/fi';
import api from '../api/axios';
import PostCard from '../components/post/PostCard';
import './Explore.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchExplore = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/posts/explore/');
      const data = res.data?.results || res.data || [];
      setPosts(data);
    } catch (err) {
      console.error('Failed to load explore', err);
      setError('Explore посттору жүктөлбөй калды.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
    setSelectedPost(null);
  };

  return (
    <div className="explore-container">
      <header className="explore-header">
        <div className="explore-title-row">
          <h1>
            <FiCompass /> Изилдөө (Explore)
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="feed-loading glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner" />
          <p>Популярдуу посттор жүктөлүүдө...</p>
        </div>
      ) : error ? (
        <div className="alert-error" style={{ textAlign: 'center' }}>
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="no-posts-box glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p>Азырынча изилдөө үчүн посттор жок.</p>
        </div>
      ) : (
        <div className="explore-grid">
          {posts.map((post) => {
            const displayImg = post.image || (post.images && post.images[0]?.image);
            const isMulti = post.images && post.images.length > 1;

            return (
              <div 
                key={post.id} 
                className="explore-item"
                onClick={() => setSelectedPost(post)}
              >
                {displayImg && (
                  <img src={displayImg} alt={post.caption || 'Explore'} className="explore-item-img" loading="lazy" />
                )}

                {isMulti && (
                  <FiLayers className="explore-carousel-icon" />
                )}

                <div className="explore-item-overlay">
                  <span className="explore-stat">
                    <FiHeart /> {post.likes_count}
                  </span>
                  <span className="explore-stat">
                    <FiMessageCircle /> {post.comments_count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Post Modal Preview */}
      {selectedPost && (
        <div className="post-modal-backdrop" onClick={() => setSelectedPost(null)}>
          <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="post-modal-close" onClick={() => setSelectedPost(null)}>
              <FiX />
            </button>
            <PostCard post={selectedPost} onPostDeleted={handlePostDeleted} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
