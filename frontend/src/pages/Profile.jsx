import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiEdit3, FiGrid, FiCamera, FiCheck, FiHeart, FiMessageCircle, FiX, FiUserPlus, FiUserCheck, FiUsers, FiBookmark } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/post/PostCard';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved'
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Modal for Followers / Following list
  const [listModal, setListModal] = useState({
    open: false,
    title: '',
    users: [],
    loading: false,
  });

  const isMyProfile = currentUser?.username === username;

  const fetchProfileAndPosts = async () => {
    try {
      setLoading(true);
      setError('');

      const [profRes, postsRes, followRes] = await Promise.all([
        api.get(`/users/${username}/`),
        api.get(`/posts/user/${username}/`),
        api.get(`/follows/${username}/toggle/`).catch(() => ({ data: { is_following: false, followers_count: 0, following_count: 0 } })),
      ]);

      setProfileData(profRes.data);
      const postsData = postsRes.data?.results || postsRes.data || [];
      setUserPosts(postsData);

      setIsFollowing(followRes.data.is_following);
      setFollowersCount(followRes.data.followers_count || 0);
      setFollowingCount(followRes.data.following_count || 0);

      if (isMyProfile) {
        setEditForm({
          first_name: profRes.data.first_name || '',
          last_name: profRes.data.last_name || '',
          bio: profRes.data.profile?.bio || '',
        });
      }
    } catch (err) {
      setError('Колдонуучу же посттор табылган жок.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      setActiveTab('posts');
      fetchProfileAndPosts();
    }
  }, [username]);

  const fetchSavedPosts = async () => {
    if (!isMyProfile) return;
    try {
      setLoadingSaved(true);
      const res = await api.get('/posts/saved/');
      const data = res.data?.results || res.data || [];
      setSavedPosts(data);
    } catch (err) {
      console.error('Failed to load saved posts', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedPosts();
    }
  }, [activeTab]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    try {
      setFollowLoading(true);
      const res = await api.post(`/follows/${username}/toggle/`);
      setIsFollowing(res.data.is_following);
      setFollowersCount(res.data.followers_count);
      setFollowingCount(res.data.following_count);
    } catch (err) {
      console.error('Follow error', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowersList = async () => {
    setListModal({ open: true, title: 'Катталуучулар (Followers)', users: [], loading: true });
    try {
      const res = await api.get(`/follows/${username}/followers/`);
      const usersList = res.data?.results || res.data || [];
      setListModal({ open: true, title: 'Катталуучулар (Followers)', users: usersList, loading: false });
    } catch {
      setListModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openFollowingList = async () => {
    setListModal({ open: true, title: 'Катталгандар (Following)', users: [], loading: true });
    try {
      const res = await api.get(`/follows/${username}/following/`);
      const usersList = res.data?.results || res.data || [];
      setListModal({ open: true, title: 'Катталгандар (Following)', users: usersList, loading: false });
    } catch {
      setListModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('first_name', editForm.first_name);
      formData.append('last_name', editForm.last_name);
      formData.append('bio', editForm.bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.patch('/users/me/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfileData((prev) => ({
        ...prev,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        profile: {
          ...prev.profile,
          bio: res.data.bio,
          avatar: res.data.avatar || prev.profile.avatar,
        },
      }));

      updateUser({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        profile: {
          ...currentUser.profile,
          bio: res.data.bio,
          avatar: res.data.avatar || currentUser.profile?.avatar,
        },
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Профилди сактоодо ката кетти.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setUserPosts((prev) => prev.filter((p) => p.id !== deletedId));
    if (selectedPost?.id === deletedId) {
      setSelectedPost(null);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner" />
        <p>Профиль жүктөлүүдө...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="profile-error glass-card">
        <h3>Ката</h3>
        <p>{error || 'Профиль табылган жок'}</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header-card glass-card">
        <div className="profile-avatar-section">
          {profileData.profile?.avatar ? (
            <img src={profileData.profile.avatar} alt={profileData.username} className="profile-main-avatar" />
          ) : (
            <div className="profile-main-avatar placeholder">
              {profileData.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-main-info">
          <div className="profile-action-row">
            <h1 className="profile-heading-username">@{profileData.username}</h1>
            {isMyProfile ? (
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="btn-secondary edit-profile-btn"
              >
                <FiEdit3 /> {isEditing ? 'Жабуу' : 'Профилди оңдоо'}
              </button>
            ) : (
              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`follow-action-btn ${isFollowing ? 'following' : 'primary'}`}
              >
                {followLoading ? (
                  '...'
                ) : isFollowing ? (
                  <>
                    <FiUserCheck /> Жазылгансыз
                  </>
                ) : (
                  <>
                    <FiUserPlus /> Жазылуу
                  </>
                )}
              </button>
            )}
          </div>

          <div className="profile-stats-row">
            <div className="stat-box">
              <span className="stat-num">{userPosts.length}</span>
              <span className="stat-title">пост</span>
            </div>
            <div className="stat-box clickable" onClick={openFollowersList} title="Көрүү">
              <span className="stat-num">{followersCount}</span>
              <span className="stat-title">катталуучулар</span>
            </div>
            <div className="stat-box clickable" onClick={openFollowingList} title="Көрүү">
              <span className="stat-num">{followingCount}</span>
              <span className="stat-title">катталгандар</span>
            </div>
          </div>

          <div className="profile-bio-section">
            <h2 className="profile-full-name">
              {profileData.first_name ? `${profileData.first_name} ${profileData.last_name || ''}` : profileData.username}
            </h2>
            {profileData.profile?.bio && (
              <p className="profile-bio-text">{profileData.profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && isMyProfile && (
        <form onSubmit={handleSaveProfile} className="edit-profile-card glass-card">
          <h3>Профилди өзгөртүү</h3>

          <div className="avatar-edit-box">
            <div className="avatar-preview-wrapper">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="preview-img" />
              ) : profileData.profile?.avatar ? (
                <img src={profileData.profile.avatar} alt="Current" className="preview-img" />
              ) : (
                <div className="profile-main-avatar placeholder mini">
                  {profileData.username.charAt(0).toUpperCase()}
                </div>
              )}
              <label htmlFor="avatar-upload-input" className="avatar-change-btn">
                <FiCamera />
              </label>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <span className="avatar-hint">Жаңы сүрөт тандоо үчүн басыңыз</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Атыңыз</label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                className="form-input"
                placeholder="Атыңыз"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Фамилияңыз</label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="form-input"
                placeholder="Фамилияңыз"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Биография (Bio)</label>
            <textarea
              rows="3"
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="form-input"
              placeholder="Өзүңүз жөнүндө кыскача жазыңыз..."
              maxLength={500}
            />
          </div>

          <div className="edit-actions">
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
              Жокко чыгаруу
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              <FiCheck /> {isSaving ? 'Сакталууда...' : 'Сактоо'}
            </button>
          </div>
        </form>
      )}

      {/* Posts Section Tabs */}
      <div className="profile-posts-tabs">
        <button 
          className={`posts-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
          type="button"
        >
          <FiGrid /> ПОСТТОР ({userPosts.length})
        </button>

        {isMyProfile && (
          <button 
            className={`posts-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
            type="button"
          >
            <FiBookmark /> САКТАЛГАНДАР ({savedPosts.length})
          </button>
        )}
      </div>

      {/* Posts Grid Container */}
      <div className="profile-posts-grid">
        {activeTab === 'saved' && loadingSaved ? (
          <div className="no-posts-box glass-card">
            <p>Сакталган посттор жүктөлүүдө...</p>
          </div>
        ) : (activeTab === 'posts' ? userPosts : savedPosts).length > 0 ? (
          <div className="posts-thumbnail-grid">
            {(activeTab === 'posts' ? userPosts : savedPosts).map((p) => (
              <div 
                key={p.id} 
                className="post-thumbnail-item"
                onClick={() => setSelectedPost(p)}
              >
                <img src={p.image || (p.images && p.images[0]?.image)} alt={p.caption || 'Post'} className="thumbnail-img" />
                <div className="thumbnail-overlay">
                  <span className="overlay-stat"><FiHeart /> {p.likes_count}</span>
                  <span className="overlay-stat"><FiMessageCircle /> {p.comments_count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-posts-box glass-card">
            <p>{activeTab === 'posts' ? 'Азырынча эч кандай пост жок.' : 'Сакталган посттор жок.'}</p>
          </div>
        )}
      </div>

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

      {/* Followers / Following List Modal */}
      {listModal.open && (
        <div className="post-modal-backdrop" onClick={() => setListModal((prev) => ({ ...prev, open: false }))}>
          <div className="user-list-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiUsers /> {listModal.title}</h3>
              <button className="modal-close-btn" onClick={() => setListModal((prev) => ({ ...prev, open: false }))}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {listModal.loading ? (
                <div className="modal-spinner">
                  <div className="spinner mini" />
                  <p>Жүктөлүүдө...</p>
                </div>
              ) : listModal.users.length === 0 ? (
                <div className="modal-empty">Эч ким жок.</div>
              ) : (
                <div className="modal-user-list">
                  {listModal.users.map((u) => (
                    <Link
                      key={u.id}
                      to={`/profile/${u.username}`}
                      onClick={() => setListModal((prev) => ({ ...prev, open: false }))}
                      className="modal-user-item"
                    >
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.username} className="modal-user-avatar" />
                      ) : (
                        <div className="modal-user-avatar placeholder">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="modal-user-info">
                        <span className="modal-user-name">
                          {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                        </span>
                        <span className="modal-user-username">@{u.username}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
