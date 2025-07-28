import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './Room.css';

const Room = ({ roomId, user, onLeave }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friends, setFriends] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojis] = useState(['😀', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '👏']);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    theme: 'dark',
    allowScreenShare: true,
    allowVoiceChat: true,
    maxUsers: 10,
    isPrivate: false
  });
  const [notifications, setNotifications] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [roomStats, setRoomStats] = useState({
    totalMessages: 0,
    activeUsers: 0,
    sessionDuration: 0
  });
  
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const peersRef = useRef({});
  const userVideoRef = useRef(null);

  useEffect(() => {
    // Socket.io bağlantısı
    const newSocket = io('https://trae-backend.onrender.com', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Room'a katıl
      newSocket.emit('join-room', { roomId });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('joined-room', (data) => {
      setRoom(data.room);
      setRoomUsers(data.users);
    });

    newSocket.on('room-users', (users) => {
      setRoomUsers(users);
    });

    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('video-sync', (data) => {
      if (videoRef.current) {
        if (data.action === 'play') {
          videoRef.current.play();
          setIsVideoPlaying(true);
        } else if (data.action === 'pause') {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        } else if (data.action === 'seek' && data.timestamp) {
          videoRef.current.currentTime = data.timestamp;
        }
      }
    });

    newSocket.on('webrtc-signal', (data) => {
      const peer = peersRef.current[data.fromUserId];
      if (peer) {
        peer.signal(data.signal);
      }
    });

    // Arkadaş davet event'lerini dinle
    newSocket.on('friend-invitation', (invitation) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'System',
        message: `🎉 ${invitation.fromEmail} arkadaş olarak ${invitation.toEmail} adresini davet etti!`,
        timestamp: new Date()
      }]);
    });

    newSocket.on('friend-invite-sent', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'System',
        message: `✅ ${data.message}`,
        timestamp: new Date()
      }]);
      setShowFriendModal(false);
      setFriendEmail('');
    });

    // Ekran paylaşım event'lerini dinle
    newSocket.on('user-screen-share-started', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'System',
        message: `📺 ${data.email} ekran paylaşımını başlattı`,
        timestamp: new Date()
      }]);
    });

    newSocket.on('user-screen-share-stopped', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'System',
        message: `📺 ${data.email} ekran paylaşımını durdurdu`,
        timestamp: new Date()
      }]);
    });

    // Listen for room settings updates
    newSocket.on('room-settings-updated', (data) => {
      setRoomSettings(data.settings);
      addNotification(`Room settings updated by ${data.updatedBy}`, 'info');
    });

    // Listen for user kick events
    newSocket.on('kicked-from-room', (data) => {
      addNotification(`You were kicked from the room by ${data.kickedBy}`, 'error');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    });

    newSocket.on('user-kicked', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'System',
        message: `${data.kickedUser} was kicked by ${data.kickedBy}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    });

    // Listen for user status updates
    newSocket.on('user-status-updated', (data) => {
      setRoomUsers(prev => prev.map(user => 
        user.email === data.email 
          ? { ...user, status: data.status }
          : user
      ));
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message);
    });

    setSocket(newSocket);

    // Mikrofon erişimi
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        setStream(stream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Mikrofon erişimi reddedildi:', err);
      });

    return () => {
      newSocket.disconnect();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => peer.destroy());
    };
  }, [roomId]);

  useEffect(() => {
    // Yeni kullanıcılar için WebRTC bağlantısı kur
    if (stream && socket) {
      roomUsers.forEach(roomUser => {
        if (roomUser.userId !== user.id && !peersRef.current[roomUser.userId]) {
          createPeer(roomUser.userId, true);
        }
      });
    }
  }, [roomUsers, stream, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createPeer = (userId, initiator) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: stream
    });

    peer.on('signal', signal => {
      socket.emit('webrtc-signal', {
        targetUserId: userId,
        signal,
        roomId
      });
    });

    peer.on('stream', stream => {
      // Diğer kullanıcının ses stream'ini oynat
      const audio = new Audio();
      audio.srcObject = stream;
      audio.play();
    });

    peer.on('error', err => {
      console.error('Peer error:', err);
    });

    peersRef.current[userId] = peer;
    setPeers(prev => ({ ...prev, [userId]: peer }));

    return peer;
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('send-message', {
        message: newMessage,
        roomId
      });
      setNewMessage('');
    }
  };

  const handleVideoControl = (action, timestamp) => {
    if (socket) {
      socket.emit('video-control', {
        action,
        timestamp,
        roomId
      });
    }
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    handleVideoControl('play');
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    handleVideoControl('pause');
  };

  const handleVideoSeek = () => {
    if (videoRef.current) {
      handleVideoControl('seek', videoRef.current.currentTime);
    }
  };



  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setScreenStream(displayStream);
      setIsScreenSharing(true);
      
      // Backend'e ekran paylaşımının başladığını bildir
      if (socket) {
        socket.emit('screen-share-start', { roomId });
      }
      
      // Ekran paylaşımını diğer kullanıcılara gönder
      Object.values(peersRef.current).forEach(peer => {
        displayStream.getTracks().forEach(track => {
          peer.replaceTrack(
            peer.streams[0].getVideoTracks()[0],
            track,
            peer.streams[0]
          );
        });
      });
      
      // Ekran paylaşımı bittiğinde
      displayStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
    } catch (err) {
      console.error('Ekran paylaşımı başlatılamadı:', err);
      alert('Ekran paylaşımı için izin gerekli!');
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    
    // Backend'e ekran paylaşımının durduğunu bildir
    if (socket) {
      socket.emit('screen-share-stop', { roomId });
    }
    
    // Kameraya geri dön
    if (stream) {
      Object.values(peersRef.current).forEach(peer => {
        if (peer && stream.getVideoTracks()[0]) {
          const sender = peer._pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(stream.getVideoTracks()[0]);
          }
        }
      });
    }
  };

  const addFriend = () => {
    if (friendEmail.trim() && socket) {
      socket.emit('add-friend', {
        friendEmail: friendEmail.trim(),
        roomId
      });
      setFriendEmail('');
      setShowFriendModal(false);
    }
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Bildirim sistemi
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type, // 'info', 'success', 'warning', 'error'
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
    
    // 5 saniye sonra bildirimi kaldır
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Oda ayarlarını güncelle
  const updateRoomSettings = (newSettings) => {
    setRoomSettings(prev => ({ ...prev, ...newSettings }));
    if (socket) {
      socket.emit('update-room-settings', { roomId, settings: newSettings });
    }
    addNotification('Oda ayarları güncellendi', 'success');
  };

  // Kullanıcı yetkilerini kontrol et
  const hasPermission = (permission) => {
    return userPermissions[user.email]?.includes(permission) || user.role === 'admin';
  };

  // Kullanıcıyı odadan at (sadece admin)
  const kickUser = (userEmail) => {
    if (hasPermission('kick')) {
      if (socket) {
        socket.emit('kick-user', { roomId, userEmail });
      }
      addNotification(`${userEmail} odadan atıldı`, 'warning');
    }
  };

  // Oda istatistiklerini güncelle
  const updateRoomStats = () => {
    setRoomStats(prev => ({
      ...prev,
      totalMessages: messages.length,
      activeUsers: roomUsers.length,
      sessionDuration: prev.sessionDuration + 1
    }));
  };



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!room) {
    return (
      <div className="room-loading">
        <div className="loading-spinner"></div>
        <p>Room yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="room-container">
      <div className="room-header">
        <div className="room-info">
          <h2>{room.name}</h2>
          <p>{room.description}</p>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Bağlı' : 'Bağlantı kesildi'}
          </div>
        </div>
        <div className="room-actions">
          <button 
            className={`mute-btn ${isMuted ? 'muted' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
            disabled={!roomSettings.allowVoiceChat}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>
          
          <button 
            className={`screen-share-btn ${isScreenSharing ? 'sharing' : ''}`}
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            title={isScreenSharing ? 'Ekran Paylaşımını Durdur' : 'Ekran Paylaşımını Başlat'}
            disabled={!roomSettings.allowScreenShare}
          >
            {isScreenSharing ? '🛑' : '📺'}
          </button>
          
          <button 
            className="friend-btn"
            onClick={() => setShowFriendModal(true)}
            title="Arkadaş Ekle"
          >
            👥
          </button>
          
          <button 
            className="settings-btn"
            onClick={() => setShowRoomSettings(true)}
            title="Oda Ayarları"
          >
            ⚙️
          </button>
          
          <button className="leave-btn" onClick={onLeave}>
            Odadan Çık
          </button>
        </div>
        
        {/* Bildirimler */}
        <div className="notifications">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              <span>{notification.message}</span>
              <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}>
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="room-content">
        <div className="video-section">

          
          <div className="video-display-area">
            {isScreenSharing ? (
              <div className="screen-share-display">
                <video
                  ref={userVideoRef}
                  autoPlay
                  muted
                  className="screen-share-video"
                />
                <div className="screen-share-indicator">
                  🖥️ Ekran Paylaşılıyor
                </div>
              </div>
            ) : (
              <div className="video-player">
                <video
                  ref={videoRef}
                  controls
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onSeeked={handleVideoSeek}
                  className="main-video"
                >
                  Video desteklenmiyor.
                </video>
              </div>
            )}
            
            {/* Diğer kullanıcıların video stream'leri */}
            <div className="peer-videos">
              {Object.entries(peers).map(([userId, peer]) => (
                <div key={userId} className="peer-video-container">
                  <video
                    autoPlay
                    className="peer-video"
                    ref={el => {
                      if (el && peer.streams && peer.streams[0]) {
                        el.srcObject = peer.streams[0];
                      }
                    }}
                  />
                  <div className="peer-video-label">
                    {roomUsers.find(u => u.userId === userId)?.email || 'Kullanıcı'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="users-section">
            <h3>Katılımcılar ({roomUsers.length}/{roomSettings.maxUsers})</h3>
            <div className="room-stats">
              <div className="stat-item">
                <span>💬 Mesajlar: {roomStats.totalMessages}</span>
              </div>
              <div className="stat-item">
                <span>⏱️ Süre: {Math.floor(roomStats.sessionDuration / 60)}dk</span>
              </div>
            </div>
            <div className="users-list">
              {roomUsers.map(roomUser => (
                <div key={roomUser.userId} className="user-item">
                  <div className="user-avatar">
                    {roomUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-email">{roomUser.email}</span>
                    <span className="user-status">
                      {roomUser.userId === user.id ? '(Sen)' : ''}
                      {roomUser.role === 'admin' ? ' 👑' : ''}
                      {roomUser.isMuted ? ' 🔇' : ''}
                      {roomUser.isScreenSharing ? ' 📺' : ''}
                    </span>
                  </div>
                  {hasPermission('kick') && roomUser.userId !== user.id && (
                    <button 
                      className="kick-btn"
                      onClick={() => kickUser(roomUser.email)}
                      title="Kullanıcıyı At"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="chat-section">
            <h3>Sohbet</h3>
            <div className="messages-container">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.userId === user.id ? 'own-message' : ''}`}>
                  <div className="message-header">
                    <span className="message-author">{message.email}</span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">{message.message}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="message-input-container">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="emoji-btn"
              >
                😀
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker">
                  {emojis.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => insertEmoji(emoji)}
                      className="emoji-option"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="text"
                placeholder="Mesaj yazın..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="message-input"
              />
              <button onClick={sendMessage} className="send-btn">
                Gönder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Arkadaş Ekleme Modal */}
      {showFriendModal && (
        <div className="modal-overlay">
          <div className="friend-modal">
            <div className="modal-header">
              <h3>Arkadaş Ekle</h3>
              <button 
                onClick={() => setShowFriendModal(false)} 
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <p>Arkadaşınızın email adresini girin:</p>
              <input
                type="email"
                placeholder="arkadas@email.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="friend-email-input"
                onKeyPress={(e) => e.key === 'Enter' && addFriend()}
              />
              <div className="modal-actions">
                <button onClick={addFriend} className="add-friend-btn">
                  Davet Gönder
                </button>
                <button 
                  onClick={() => setShowFriendModal(false)} 
                  className="cancel-btn"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Oda Ayarları Modal */}
      {showRoomSettings && (
        <div className="modal-overlay">
          <div className="settings-modal">
            <div className="modal-header">
              <h3>Oda Ayarları</h3>
              <button 
                onClick={() => setShowRoomSettings(false)} 
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="setting-group">
                <label>Tema:</label>
                <select 
                  value={roomSettings.theme} 
                  onChange={(e) => updateRoomSettings({ theme: e.target.value })}
                >
                  <option value="dark">Koyu</option>
                  <option value="light">Açık</option>
                  <option value="neon">Neon</option>
                </select>
              </div>
              
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={roomSettings.allowScreenShare}
                    onChange={(e) => updateRoomSettings({ allowScreenShare: e.target.checked })}
                  />
                  Ekran Paylaşımına İzin Ver
                </label>
              </div>
              
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={roomSettings.allowVoiceChat}
                    onChange={(e) => updateRoomSettings({ allowVoiceChat: e.target.checked })}
                  />
                  Sesli Sohbete İzin Ver
                </label>
              </div>
              
              <div className="setting-group">
                <label>Maksimum Kullanıcı:</label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={roomSettings.maxUsers}
                  onChange={(e) => updateRoomSettings({ maxUsers: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={roomSettings.isPrivate}
                    onChange={(e) => updateRoomSettings({ isPrivate: e.target.checked })}
                  />
                  Özel Oda
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="save-btn"
                onClick={() => setShowRoomSettings(false)}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gizli audio element kullanıcının kendi sesi için */}
      <audio ref={userVideoRef} muted autoPlay style={{ display: 'none' }} />
    </div>
  );
};

export default Room;