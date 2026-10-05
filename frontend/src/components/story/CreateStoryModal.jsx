import React, { useState, useRef } from 'react';
import { FiX, FiUploadCloud, FiImage } from 'react-icons/fi';
import api from '../../api/axios';
import './CreateStoryModal.css';

const CreateStoryModal = ({ isOpen, onClose, onStoryCreated }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const isVideo = selected.type.startsWith('video');
    setMediaType(isVideo ? 'video' : 'image');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Сураныч, сүрөт же видео тандаңыз.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('media_file', file);
      formData.append('media_type', mediaType);
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      const res = await api.post('/stories/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onStoryCreated(res.data);
      handleClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Story жүктөлдү ката кетти.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview('');
    setCaption('');
    setError('');
    onClose();
  };

  return (
    <div className="create-story-overlay" onClick={handleClose}>
      <div className="create-story-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-story-header">
          <h3>Жаңы Story (Тарых) кошуу</h3>
          <button className="create-story-close-btn" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="create-story-body">
            {error && <div className="alert-error" style={{ margin: 0 }}>{error}</div>}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              style={{ display: 'none' }}
            />

            {!preview ? (
              <div 
                className="story-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUploadCloud className="story-upload-icon" />
                <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Сүрөт же видео тандаңыз</p>
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>24 саат бою көрүнөт</span>
              </div>
            ) : (
              <div className="story-preview-container">
                {mediaType === 'video' ? (
                  <video src={preview} className="story-preview-media" autoPlay muted loop />
                ) : (
                  <img src={preview} alt="Preview" className="story-preview-media" />
                )}
                <button 
                  type="button" 
                  className="story-change-media-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Өзгөртүү
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Кыскача жазуу кошуу (милдеттүү эмес)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="story-caption-input"
              maxLength={200}
            />
          </div>

          <div className="create-story-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Жокко чыгаруу
            </button>
            <button 
              type="submit" 
              className="publish-story-btn"
              disabled={loading || !file}
            >
              {loading ? 'Жүктөлүүдө...' : 'Story Бөлүшүү 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryModal;
