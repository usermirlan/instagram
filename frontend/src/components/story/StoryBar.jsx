import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StoryViewerModal from './StoryViewerModal';
import CreateStoryModal from './CreateStoryModal';
import './StoryBar.css';

const StoryBar = () => {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stories/feed/');
      setUserStories(res.data || []);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleOpenViewer = (index) => {
    setSelectedUserIndex(index);
    setViewerOpen(true);
  };

  const handleStoryCreated = () => {
    fetchStories();
  };

  const handleStoriesViewed = (userId, storyId) => {
    setUserStories((prev) =>
      prev.map((u) => {
        if (u.user.id === userId) {
          const updatedStories = u.stories.map((s) =>
            s.id === storyId ? { ...s, is_viewed: true } : s
          );
          const hasUnviewed = updatedStories.some((s) => !s.is_viewed);
          return { ...u, stories: updatedStories, has_unviewed: hasUnviewed };
        }
        return u;
      })
    );
  };

  // Find if current user has any active story
  const myStoryData = userStories.find((item) => item.user.id === user?.id);
  const otherStories = userStories.filter((item) => item.user.id !== user?.id);

  return (
    <>
      <div className="stories-bar-container">
        {/* Current user's circle: either add story or view own story */}
        <div className="story-circle-item" onClick={() => myStoryData ? handleOpenViewer(0) : setCreateOpen(true)}>
          <div className={`story-ring ${myStoryData ? (myStoryData.has_unviewed ? 'unviewed' : 'viewed') : 'my-story-empty'}`}>
            <div className="story-avatar-inner">
              {user?.profile?.avatar ? (
                <img src={user.profile.avatar} alt="My story" className="story-img" />
              ) : (
                <div className="story-placeholder-letter">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            {/* Plus icon badge */}
            <div 
              className="story-add-badge" 
              onClick={(e) => {
                e.stopPropagation();
                setCreateOpen(true);
              }}
              title="Story кошуу"
            >
              <FiPlus />
            </div>
          </div>
          <span className="story-author-name">Сиздин story</span>
        </div>

        {/* Other Users' Stories */}
        {otherStories.map((item, idx) => {
          // If myStoryData is at index 0, offset index by 1
          const actualIndex = myStoryData ? idx + 1 : idx;

          return (
            <div 
              key={item.user.id} 
              className="story-circle-item"
              onClick={() => handleOpenViewer(actualIndex)}
            >
              <div className={`story-ring ${item.has_unviewed ? 'unviewed' : 'viewed'}`}>
                <div className="story-avatar-inner">
                  {item.user.avatar ? (
                    <img src={item.user.avatar} alt={item.user.username} className="story-img" />
                  ) : (
                    <div className="story-placeholder-letter">
                      {item.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="story-author-name">{item.user.username}</span>
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {viewerOpen && userStories.length > 0 && (
        <StoryViewerModal
          userStoriesList={userStories}
          initialUserIndex={selectedUserIndex}
          onClose={() => setViewerOpen(false)}
          onStoriesViewed={handleStoriesViewed}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onStoryCreated={handleStoryCreated}
      />
    </>
  );
};

export default StoryBar;
