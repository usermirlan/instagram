import React, { useState, useRef } from 'react';
import { FiX, FiUploadCloud, FiImage, FiCheck } from 'react-icons/fi';
import api from '../../api/axios';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Валидация өлчөмү: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Сүрөттүн өлчөмү 5MBдан ашпашы керек.');
      return;
    }

    // Валидация форматы
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('JPG, PNG же WebP форматындагы сүрөт тандаңыз.');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Пост үчүн сүрөт тандаңыз.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', caption.trim());

      const res = await api.post('/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (onPostCreated) {
        onPostCreated(res.data);
      }

      handleClose();
    } catch (err) {
      console.error('Post upload failed', err);
      const detail = err.response?.data?.image?.[0] || 'Пост жарыялоодо ката кетти.';
      setError(detail);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setImageFile(null);
    setImagePreview(null);
    setCaption('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Жаңы Пост Түзүү</h2>
          <button onClick={handleClose} className="modal-close-btn" aria-label="Close">
            <FiX />
          </button>
        </div>

        {error && <div className="alert-error" style={{ margin: '14px 20px 0' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="create-post-form">
          {/* Image upload area */}
          {!imagePreview ? (
            <div 
              className="dropzone-area" 
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUploadCloud className="dropzone-icon" />
              <h3>Сүрөттү бул жерге тандаңыз</h3>
              <p>JPG, PNG, WebP (макс. 5MB)</p>
              <button type="button" className="btn-secondary" style={{ marginTop: '8px' }}>
                <FiImage /> Компьютерден тандоо
              </button>
            </div>
          ) : (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="post-upload-preview" />
              <button 
                type="button" 
                onClick={handleRemoveImage} 
                className="remove-preview-btn" 
                title="Сүрөттү өчүрүү"
              >
                <FiX />
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Caption textarea */}
          <div className="modal-caption-group">
            <label className="form-label">Посттун жазуусу (Caption)</label>
            <textarea
              rows="3"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Оюңузду же сүрөт тууралуу жазыңыз..."
              className="form-input"
              maxLength={2200}
            />
            <span className="caption-counter">{caption.length} / 2200</span>
          </div>

          {/* Submit footer */}
          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn-secondary">
              Жокко чыгаруу
            </button>
            <button 
              type="submit" 
              disabled={!imageFile || isUploading} 
              className="btn-primary"
            >
              <FiCheck /> {isUploading ? 'Жүктөлүүдө...' : 'Бөлүшүү'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
