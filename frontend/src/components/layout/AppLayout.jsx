import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopHeader from './TopHeader';
import CreatePostModal from '../post/CreatePostModal';
import './AppLayout.css';

const AppLayout = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newlyCreatedPost, setNewlyCreatedPost] = useState(null);

  const handleOpenCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreatePost = () => {
    setIsCreateModalOpen(false);
  };

  const handlePostCreated = (newPost) => {
    setNewlyCreatedPost(newPost);
  };

  return (
    <div className="app-container">
      <Sidebar onOpenCreatePost={handleOpenCreatePost} />
      <TopHeader />
      
      <main className="app-main-content">
        <div className="content-wrapper">
          <Outlet context={{ 
            openCreatePost: handleOpenCreatePost,
            newlyCreatedPost,
          }} />
        </div>
      </main>

      <BottomNav onOpenCreatePost={handleOpenCreatePost} />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreatePost}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default AppLayout;
