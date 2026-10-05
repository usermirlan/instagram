import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiShare2, 
  FiMusic, 
  FiVolume2, 
  FiVolumeX, 
  FiChevronUp, 
  FiChevronDown 
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import api from '../api/axios';
import './Reels.css';

// Default / mock reels in case backend has few videos
const DEFAULT_REELS = [
  {
    id: 1001,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    author: {
      username: 'ayperi_kg',
      name: 'Айпери',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    caption: 'Бишкектин кечки шаары жана неон жарыктары ✨🇰🇬 #bishkek #nightlife',
    likes_count: 248,
    comments_count: 34,
    music: 'Original Audio - Ayperi',
    is_liked: false,
  },
  {
    id: 1002,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    author: {
      username: 'travel_kyrgyzstan',
      name: 'Кыргызстан Саякат',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    caption: 'Ысык-Көлдүн керемет толкундары 🌊 Жайкы эс алуу мезгили #issykkul #kyrgyzstan',
    likes_count: 512,
    comments_count: 82,
    music: 'Chill Waters - TravelKG',
    is_liked: false,
  },
  {
    id: 1003,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-skater-doing-a-trick-in-a-skatepark-42655-large.mp4',
    author: {
      username: 'azamat_extreme',
      name: 'Азамат',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    caption: 'Жаңы трюк үйрөндүм! Кандай чыкты? 🔥🛹',
    likes_count: 389,
    comments_count: 51,
    music: 'Skate Vibes - Beat Prod',
    is_liked: false,
  },
];

const Reels = () => {
  const [reels, setReels] = useState(DEFAULT_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const currentReel = reels[currentIndex];

  useEffect(() => {
    // Try to load any video posts from backend
    api.get('/posts/').then((res) => {
      const posts = res.data?.results || res.data || [];
      const videoPosts = posts.filter((p) => p.image && (p.image.endsWith('.mp4') || p.image.endsWith('.mov')));
      if (videoPosts.length > 0) {
        const formatted = videoPosts.map((p) => ({
          id: p.id,
          video_url: p.image,
          author: p.author,
          caption: p.caption,
          likes_count: p.likes_count,
          comments_count: p.comments_count,
          music: `Audio by @${p.author?.username}`,
          is_liked: p.is_liked,
        }));
        setReels([...formatted, ...DEFAULT_REELS]);
      }
    }).catch(() => {});
  }, []);

  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop back
    }
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleToggleLike = (reelId) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const nextLiked = !r.is_liked;
          return {
            ...r,
            is_liked: nextLiked,
            likes_count: nextLiked ? r.likes_count + 1 : r.likes_count - 1,
          };
        }
        return r;
      })
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MikoSocial Reel',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Шилтеме көчүрүлдү!');
    }
  };

  return (
    <div className="reels-page-container">
      {currentIndex > 0 && (
        <button className="reel-nav-btn up" onClick={handlePrevReel} title="Мурунку Reel">
          <FiChevronUp />
        </button>
      )}

      <div className="reels-feed">
        {currentReel && (
          <div className="reel-card">
            <video
              ref={videoRef}
              src={currentReel.video_url}
              className="reel-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onClick={toggleMute}
            />

            {/* Mute indicator badge */}
            <div className="reel-sound-badge" onClick={toggleMute}>
              {isMuted ? <FiVolumeX /> : <FiVolume2 />}
            </div>

            {/* Bottom info: author, caption, sound */}
            <div className="reel-overlay-bottom">
              <div className="reel-author-row">
                <Link to={`/profile/${currentReel.author?.username}`}>
                  <img
                    src={currentReel.author?.avatar}
                    alt={currentReel.author?.username}
                    className="reel-author-avatar"
                  />
                </Link>
                <Link to={`/profile/${currentReel.author?.username}`} className="reel-author-username">
                  @{currentReel.author?.username}
                </Link>
              </div>

              {currentReel.caption && (
                <p className="reel-caption">{currentReel.caption}</p>
              )}

              <div className="reel-audio-track">
                <FiMusic />
                <span>{currentReel.music}</span>
              </div>
            </div>

            {/* Right sidebar actions */}
            <div className="reel-actions-sidebar">
              <button
                className={`reel-action-btn ${currentReel.is_liked ? 'liked' : ''}`}
                onClick={() => handleToggleLike(currentReel.id)}
              >
                <div className="reel-action-icon-circle">
                  {currentReel.is_liked ? <FaHeart /> : <FiHeart />}
                </div>
                <span className="reel-action-count">{currentReel.likes_count}</span>
              </button>

              <button className="reel-action-btn" onClick={() => alert('Комментарийлер бөлүмү жакында!')}>
                <div className="reel-action-icon-circle">
                  <FiMessageCircle />
                </div>
                <span className="reel-action-count">{currentReel.comments_count}</span>
              </button>

              <button className="reel-action-btn" onClick={handleShare}>
                <div className="reel-action-icon-circle">
                  <FiShare2 />
                </div>
                <span className="reel-action-count">Бөлүшүү</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="reel-nav-btn down" onClick={handleNextReel} title="Кийинки Reel">
        <FiChevronDown />
      </button>
    </div>
  );
};

export default Reels;
