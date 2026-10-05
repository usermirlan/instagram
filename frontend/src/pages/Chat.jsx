import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMessageSquare, 
  FiSend, 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiUser, 
  FiCheck, 
  FiCheckCircle,
  FiImage,
  FiMic,
  FiSquare
} from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const Chat = () => {
  const { user: currentUser } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // New Chat Modal state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Filter conversations
  const [convFilter, setConvFilter] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations/');
      const items = res.data || [];
      setConversations(items);
      return items;
    } catch (err) {
      console.error('Fetch conversations error', err);
      return [];
    } finally {
      setLoadingConvs(false);
    }
  };

  // 2. Fetch messages for active conversation
  const fetchMessages = async (convId, isInitial = false) => {
    try {
      if (isInitial) setLoadingMessages(true);
      const res = await api.get(`/chat/conversations/${convId}/messages/`);
      setMessages(res.data || []);
      if (isInitial) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Fetch messages error', err);
    } finally {
      if (isInitial) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Polling for live updates every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConv) {
        fetchMessages(activeConv.id, false);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeConv]);

  // When active conversation changes
  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    setSelectedImage(null);
    setImagePreview('');
    fetchMessages(conv.id, true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveAttachedImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Voice recording toggle
  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach((track) => track.stop());
          // Send audio message directly
          await sendMediaMessage(null, audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone error', err);
        alert('Микрофонго жеткилик берилген жок.');
      }
    }
  };

  const sendMediaMessage = async (imageFile, audioBlob) => {
    if (!activeConv || sending) return;
    setSending(true);

    try {
      const formData = new FormData();
      if (imageFile) formData.append('image', imageFile);
      if (audioBlob) formData.append('audio', audioBlob, 'voice_message.webm');
      if (messageText.trim()) formData.append('text', messageText.trim());

      const res = await api.post(`/chat/conversations/${activeConv.id}/messages/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessages((prev) => [...prev, res.data]);
      setTimeout(scrollToBottom, 50);
      handleRemoveAttachedImage();
      setMessageText('');
      fetchConversations();
    } catch (err) {
      console.error('Send media message error', err);
      alert('Медиа билдирүү жөнөтүлбөй калды.');
    } finally {
      setSending(false);
    }
  };

  // Send message (text or with attached image)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !selectedImage) || !activeConv || sending) return;

    if (selectedImage) {
      await sendMediaMessage(selectedImage, null);
      return;
    }

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const res = await api.post(`/chat/conversations/${activeConv.id}/messages/`, {
        text: textToSend,
      });

      setMessages((prev) => [...prev, res.data]);
      setTimeout(scrollToBottom, 50);
      fetchConversations();
    } catch (err) {
      console.error('Send message error', err);
      alert('Билдирүү жөнөтүлбөй калды.');
    } finally {
      setSending(false);
    }
  };

  // Search users for starting new chat
  useEffect(() => {
    if (!isNewChatOpen) {
      setSearchResults([]);
      setUserSearchTerm('');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingUsers(true);
        const url = userSearchTerm.trim()
          ? `/users/search/?q=${encodeURIComponent(userSearchTerm.trim())}`
          : `/users/search/`;
        const res = await api.get(url);
        setSearchResults(res.data?.results || res.data || []);
      } catch (err) {
        console.error('Search users error', err);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchTerm, isNewChatOpen]);

  // Start chat with user
  const handleStartChatWithUser = async (targetUsername) => {
    try {
      const res = await api.post('/chat/conversations/', { username: targetUsername });
      setIsNewChatOpen(false);
      await fetchConversations();
      handleSelectConversation(res.data);
    } catch (err) {
      console.error('Start chat error', err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!convFilter.trim()) return true;
    const term = convFilter.toLowerCase();
    const other = c.other_user;
    return (
      other?.username.toLowerCase().includes(term) ||
      other?.first_name?.toLowerCase().includes(term) ||
      other?.last_name?.toLowerCase().includes(term)
    );
  });

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page-container">
      {/* Left Pane: Conversations List */}
      <div className={`chat-conversations-pane glass-card ${activeConv ? 'hide-on-mobile' : ''}`}>
        <div className="conv-pane-header">
          <h2>Кабарлар</h2>
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="new-chat-btn"
            title="Жаңы чат баштоо"
          >
            <FiPlus />
          </button>
        </div>

        {/* Search Conversation */}
        <div className="conv-search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            value={convFilter}
            onChange={(e) => setConvFilter(e.target.value)}
            placeholder="Диалогдорду издөө..."
          />
        </div>

        {/* Conversation List */}
        <div className="conv-list">
          {loadingConvs ? (
            <div className="conv-loading">
              <div className="spinner mini" />
              <p>Жүктөлүүдө...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="conv-empty">
              <p>Диалогдор жок.</p>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="btn-primary start-chat-inline-btn"
              >
                + Жаңы чат баштоо
              </button>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const other = c.other_user;
              const isSelected = activeConv?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c)}
                  className={`conv-item ${isSelected ? 'active' : ''}`}
                >
                  <div className="conv-avatar-box">
                    {other?.avatar ? (
                      <img src={other.avatar} alt={other.username} className="conv-avatar" />
                    ) : (
                      <div className="conv-avatar placeholder">
                        {other?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="conv-item-details">
                    <div className="conv-item-top">
                      <span className="conv-name">
                        {other?.first_name ? `${other.first_name} ${other.last_name || ''}` : other?.username}
                      </span>
                      {c.last_message && (
                        <span className="conv-time">
                          {formatMessageTime(c.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="conv-item-bottom">
                      <span className="conv-snippet">
                        {c.last_message
                          ? `${c.last_message.sender_username === currentUser?.username ? 'Сиз: ' : ''}${c.last_message.text}`
                          : 'Сүйлөшүүнү баштаңыз'}
                      </span>
                      {c.unread_count > 0 && (
                        <span className="conv-unread-badge">{c.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Room */}
      <div className={`chat-room-pane glass-card ${!activeConv ? 'hide-on-mobile' : ''}`}>
        {activeConv ? (
          <>
            {/* Chat Room Header */}
            <div className="chat-room-header">
              <button
                className="chat-back-btn"
                onClick={() => setActiveConv(null)}
                title="Артка"
              >
                ←
              </button>

              <Link
                to={`/profile/${activeConv.other_user?.username}`}
                className="chat-header-user"
              >
                {activeConv.other_user?.avatar ? (
                  <img
                    src={activeConv.other_user.avatar}
                    alt={activeConv.other_user.username}
                    className="chat-header-avatar"
                  />
                ) : (
                  <div className="chat-header-avatar placeholder">
                    {activeConv.other_user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="chat-header-info">
                  <span className="chat-header-name">
                    {activeConv.other_user?.first_name
                      ? `${activeConv.other_user.first_name} ${activeConv.other_user.last_name || ''}`
                      : activeConv.other_user?.username}
                  </span>
                  <span className="chat-header-username">
                    @{activeConv.other_user?.username}
                  </span>
                </div>
              </Link>
            </div>

            {/* Messages Thread */}
            <div className="chat-messages-thread">
              {loadingMessages ? (
                <div className="messages-loading">
                  <div className="spinner mini" />
                </div>
              ) : messages.length === 0 ? (
                <div className="messages-empty">
                  <FiMessageSquare className="empty-chat-icon" />
                  <p>Бул жерде билдирүүлөр пайда болот.</p>
                  <span>Салам айтып сүйлөшүүнү баштаңыз! 👋</span>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_id === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`message-bubble-row ${isMine ? 'mine' : 'theirs'}`}
                    >
                      {!isMine && (
                        <div className="bubble-avatar-box">
                          {m.sender_avatar ? (
                            <img src={m.sender_avatar} alt={m.sender_username} className="bubble-avatar" />
                          ) : (
                            <div className="bubble-avatar placeholder">
                              {m.sender_username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                        {m.image && (
                          <img 
                            src={m.image} 
                            alt="Chat image" 
                            className="bubble-image"
                            onClick={() => window.open(m.image, '_blank')} 
                          />
                        )}

                        {m.audio && (
                          <audio controls src={m.audio} className="bubble-audio" />
                        )}

                        {m.text && <p className="bubble-text">{m.text}</p>}

                        <div className="bubble-meta">
                          <span className="bubble-time">{formatMessageTime(m.created_at)}</span>
                          {isMine && (
                            <span className="bubble-status" title={m.is_read ? 'Окулду' : 'Жөнөтүлдү'}>
                              {m.is_read ? <FiCheckCircle /> : <FiCheck />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached Image Preview */}
            {imagePreview && (
              <div className="chat-pending-preview">
                <img src={imagePreview} alt="Attached preview" className="chat-pending-img" />
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Сүрөт тиркелди</span>
                <button 
                  type="button" 
                  onClick={handleRemoveAttachedImage}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                >
                  <FiX />
                </button>
              </div>
            )}

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="chat-input-bar">
              {/* Hidden file input for images */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Сүрөт тиркөө"
              >
                <FiImage />
              </button>

              <button
                type="button"
                className={`chat-mic-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleVoiceRecording}
                title={isRecording ? "Жаздырууну токтотуу жана жөнөтүү" : "Үн билдирүү жаздыруу"}
              >
                {isRecording ? <FiSquare /> : <FiMic />}
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={isRecording ? "Үн жазылууда... Токтотуу үчүн басыңыз" : "Билдирүү жазыңыз..."}
                className="chat-text-input"
                autoFocus
              />

              <button
                type="submit"
                disabled={(!messageText.trim() && !selectedImage) || sending}
                className="chat-send-btn"
                title="Жөнөтүү"
              >
                <FiSend />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon-circle">
              <FiMessageSquare />
            </div>
            <h3>Сиздин кабарларыңыз</h3>
            <p>Досторуңузга жеке билдирүү жөнөтүү үчүн сол жактагы диалогду тандаңыз же жаңы диалог баштаңыз.</p>
            <button
              onClick={() => setIsNewChatOpen(true)}
              className="btn-primary"
            >
              <FiPlus /> Жаңы билдирүү жөнөтүү
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {isNewChatOpen && (
        <div className="post-modal-backdrop" onClick={() => setIsNewChatOpen(false)}>
          <div className="new-chat-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiPlus /> Жаңы чат баштоо</h3>
              <button className="modal-close-btn" onClick={() => setIsNewChatOpen(false)}>
                <FiX />
              </button>
            </div>

            <div className="new-chat-search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Колдонуучунун атын жазыңыз..."
                autoFocus
              />
            </div>

            <div className="new-chat-users-list">
              {searchingUsers ? (
                <div className="modal-spinner">
                  <div className="spinner mini" />
                  <p>Издөөдө...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="modal-empty">Колдонуучулар табылган жок.</div>
              ) : (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleStartChatWithUser(u.username)}
                    className="modal-user-item selectable"
                  >
                    {u.profile?.avatar ? (
                      <img src={u.profile.avatar} alt={u.username} className="modal-user-avatar" />
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
