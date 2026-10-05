import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../api/axios';
import './StoryViewerModal.css';

const StoryViewerModal = ({ userStoriesList, initialUserIndex = 0, onClose, onStoriesViewed }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const currentUserData = userStoriesList[currentUserIndex];
  const currentStories = currentUserData?.stories || [];
  const currentStory = currentStories[currentStoryIndex];

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && !currentStory.is_viewed) {
      api.post(`/stories/${currentStory.id}/view/`).catch(() => {});
      if (onStoriesViewed) {
        onStoriesViewed(currentUserData.user.id, currentStory.id);
      }
    }
  }, [currentStory]);

  // Story progress timer (5 seconds per photo, or custom)
  useEffect(() => {
    setProgress(0);
    if (!currentStory) return;

    const duration = currentStory.media_type === 'video' ? 12000 : 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          handleNext();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [currentUserIndex, currentStoryIndex]);

  const handleNext = () => {
    if (currentStoryIndex < currentStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else if (currentUserIndex < userStoriesList.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex((prev) => prev - 1);
      const prevUserStories = userStoriesList[currentUserIndex - 1]?.stories || [];
      setCurrentStoryIndex(Math.max(0, prevUserStories.length - 1));
    }
  };

  if (!currentUserData || !currentStory) return null;

  return (
    <div className="story-viewer-overlay">
      {/* Previous User Button */}
      {currentUserIndex > 0 && (
        <button className="story-nav-btn prev" onClick={handlePrev}>
          <FiChevronLeft />
        </button>
      )}

      <div className="story-viewer-container">
        {/* Progress Bars */}
        <div className="story-progress-bars">
          {currentStories.map((s, idx) => {
            let fillWidth = '0%';
            if (idx < currentStoryIndex) fillWidth = '100%';
            else if (idx === currentStoryIndex) fillWidth = `${progress}%`;

            return (
              <div key={s.id} className="story-progress-track">
                <div className="story-progress-fill" style={{ width: fillWidth }} />
              </div>
            );
          })}
        </div>

        {/* User Info Header */}
        <div className="story-viewer-header">
          <div className="story-user-info">
            {currentUserData.user.avatar ? (
              <img 
                src={currentUserData.user.avatar} 
                alt={currentUserData.user.username} 
                className="story-user-avatar" 
              />
            ) : (
              <div className="story-user-avatar" style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                {currentUserData.user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="story-user-name">
              {currentUserData.user.username}
              <span className="story-time">
                • {new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
          </div>

          <button className="story-close-btn" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Story Media */}
        <div className="story-media-wrapper">
          {currentStory.media_type === 'video' ? (
            <video 
              src={currentStory.media_file} 
              className="story-display-media" 
              autoPlay 
              playsInline 
            />
          ) : (
            <img 
              src={currentStory.media_file} 
              alt="Story" 
              className="story-display-media" 
            />
          )}

          {currentStory.caption && (
            <div className="story-caption-overlay">
              {currentStory.caption}
            </div>
          )}

          {/* Touch zones */}
          <div className="story-tap-left" onClick={handlePrev} />
          <div className="story-tap-right" onClick={handleNext} />
        </div>
      </div>

      {/* Next User Button */}
      {(currentUserIndex < userStoriesList.length - 1 || currentStoryIndex < currentStories.length - 1) && (
        <button className="story-nav-btn next" onClick={handleNext}>
          <FiChevronRight />
        </button>
      )}
    </div>
  );
};

export default StoryViewerModal;
