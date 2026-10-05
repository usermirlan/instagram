import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiTrash2, 
  FiSend,
  FiMoreHorizontal,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { FaHeart, FaBookmark } from 'react-icons/fa';
import api from '../../api/axios';
import './PostCard.css';

const PostCard = ({ post, onPostDeleted }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Карусель сүрөттөрүнүн тизмеси
  const imagesList = post.images && post.images.length > 0 
    ? post.images.map((img) => img.image)
    : (post.image ? [post.image] : []);

  // Сакталгандар (Bookmark) toggle
  const handleToggleSave = async () => {
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    try {
      const res = await api.post(`/posts/${post.id}/bookmark/`);
      setIsSaved(res.data.is_saved);
    } catch {
      setIsSaved(prevSaved);
    }
  };

  // Лайк басуу же кайтарып алуу (Optimistic UI)
  const handleToggleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setIsLikeAnimating(!prevLiked);

    try {
      const res = await api.post(`/posts/${post.id}/like/`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setTimeout(() => setIsLikeAnimating(false), 500);
    }
  };

  // Комментарийлерди жүктөө
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      try {
        setLoadingComments(true);
        const res = await api.get(`/posts/${post.id}/comments/`);
        const data = res.data?.results || res.data || [];
        setComments(data);
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  // Жаңы комментарий кошуу
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/posts/${post.id}/comments/`, {
        text: commentText.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setCommentsCount((prev) => prev + 1);
      setCommentText('');
      setShowComments(true);
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Комментарийди өчүрүү
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}/`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  // Постту өчүрүү (автор үчүн)
  const handleDeletePost = async () => {
    if (!window.confirm('Бул постту өчүрүүнү каалайсызбы?')) return;
    try {
      await api.delete(`/posts/${post.id}/`);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      alert('Постту өчүрүүдө ката кетти.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('ky-KG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="post-card glass-card">
      {/* Header */}
      <header className="post-header">
        <Link to={`/profile/${post.author?.username}`} className="post-author-link">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.username} className="post-author-avatar" />
          ) : (
            <div className="post-author-placeholder">
              {post.author?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="post-author-meta">
            <span className="post-author-name">{post.author?.name || post.author?.username}</span>
            <span className="post-timestamp">{formatDate(post.created_at)}</span>
          </div>
        </Link>

        {post.is_author && (
          <button onClick={handleDeletePost} className="post-delete-btn" title="Постту өчүрүү">
            <FiTrash2 />
          </button>
        )}
      </header>

      {/* Media / Carousel */}
      <div className="post-image-container" onDoubleClick={handleToggleLike}>
        {imagesList.length > 0 ? (
          <img 
            src={imagesList[currentImageIndex]} 
            alt={post.caption || 'Post'} 
            className="post-image" 
            loading="lazy" 
          />
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', color: '#94a3b8' }}>
            Сүрөт жок
          </div>
        )}

        {/* Carousel controls if more than 1 image */}
        {imagesList.length > 1 && (
          <>
            <span className="carousel-counter-badge">
              {currentImageIndex + 1}/{imagesList.length}
            </span>

            {currentImageIndex > 0 && (
              <button 
                type="button" 
                className="carousel-btn prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => prev - 1);
                }}
              >
                <FiChevronLeft />
              </button>
            )}

            {currentImageIndex < imagesList.length - 1 && (
              <button 
                type="button" 
                className="carousel-btn next"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => prev + 1);
                }}
              >
                <FiChevronRight />
              </button>
            )}

            <div className="carousel-dots">
              {imagesList.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}

        {isLikeAnimating && isLiked && (
          <div className="big-heart-animation">
            <FaHeart />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="post-actions">
        <div className="post-actions-left">
          <button 
            onClick={handleToggleLike} 
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            aria-label="Like"
          >
            {isLiked ? <FaHeart className="heart-icon filled" /> : <FiHeart className="heart-icon" />}
            <span className="action-count">{likesCount}</span>
          </button>

          <button 
            onClick={handleToggleComments} 
            className="action-btn comment-btn"
            aria-label="Comments"
          >
            <FiMessageCircle className="comment-icon" />
            <span className="action-count">{commentsCount}</span>
          </button>
        </div>

        {/* Bookmark / Save */}
        <button 
          onClick={handleToggleSave} 
          className={`action-btn bookmark-btn ${isSaved ? 'saved' : ''}`}
          title={isSaved ? "Сакталгандардан өчүрүү" : "Сактоо"}
          aria-label="Save Post"
        >
          {isSaved ? <FaBookmark /> : <FiBookmark />}
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="post-caption-box">
          <Link to={`/profile/${post.author?.username}`} className="caption-username">
            @{post.author?.username}
          </Link>
          <span className="caption-text">{post.caption}</span>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="post-comments-container">
          {loadingComments ? (
            <p className="comments-loading">Комментарийлер жүктөлүүдө...</p>
          ) : comments.length > 0 ? (
            <div className="comments-list">
              {comments.map((c) => (
                <div key={c.id} className="comment-item">
                  <div className="comment-content">
                    <Link to={`/profile/${c.author.username}`} className="comment-author-name">
                      @{c.author.username}
                    </Link>
                    <span className="comment-text">{c.text}</span>
                  </div>
                  {c.is_author && (
                    <button 
                      onClick={() => handleDeleteComment(c.id)} 
                      className="comment-del-btn" 
                      title="Өчүрүү"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments-yet">Биринчи болуп комментарий жазыңыз!</p>
          )}

          {/* Comment Input Form */}
          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Комментарий калтырыңыз..."
              className="comment-input"
              maxLength={1000}
            />
            <button 
              type="submit" 
              disabled={!commentText.trim() || submittingComment} 
              className="comment-submit-btn"
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export default PostCard;
