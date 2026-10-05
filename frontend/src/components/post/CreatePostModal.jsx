import React, { useState, useRef } from 'react';
import { FiX, FiUploadCloud, FiImage, FiCheck } from 'react-icons/fi';
import api from '../../api/axios';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Ар бир сүрөт 10MBдан ашпашы керек.');
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setError('');
    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...validPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFiles.length) {
      setError('Пост үчүн жок дегенде бир сүрөт тандаңыз.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      // Primary image
      formData.append('image', imageFiles[0]);
      // Carousel images
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
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
    setImageFiles([]);
    setImagePreviews([]);
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
          {!imagePreviews.length ? (
            <div 
              className="dropzone-area" 
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUploadCloud className="dropzone-icon" />
              <h3>Сүрөттөрдү бул жерге тандаңыз</h3>
              <p>JPG, PNG, WebP (бир же бир нече сүрөт / карусель)</p>
              <button type="button" className="btn-secondary" style={{ marginTop: '8px' }}>
                <FiImage /> Компьютерден тандоо
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {imagePreviews.map((previewUrl, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                    <img 
                      src={previewUrl} 
                      alt={`Preview ${idx + 1}`} 
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage(idx)} 
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title="Өчүрүү"
                    >
                      <FiX size={14} />
                    </button>
                    {idx === 0 && (
                      <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
                        Башкы
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '6px 12px', alignSelf: 'flex-start' }}
              >
                + Дагы сүрөт кошуу
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
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
              disabled={!imageFiles.length || isUploading} 
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
