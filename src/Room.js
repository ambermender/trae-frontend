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
  const [videoUrl, setVideoUrl] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
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

  const loadVideo = () => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
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
          <button onClick={toggleMute} className={`voice-btn ${isMuted ? 'muted' : 'unmuted'}`}>
            {isMuted ? '🔇' : '🎤'}
          </button>
          <button onClick={onLeave} className="leave-btn">
            Ayrıl
          </button>
        </div>
      </div>

      <div className="room-content">
        <div className="video-section">
          <div className="video-controls">
            <input
              type="text"
              placeholder="Video URL'si girin"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="video-url-input"
            />
            <button onClick={loadVideo} className="load-video-btn">
              Video Yükle
            </button>
          </div>
          
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
        </div>

        <div className="sidebar">
          <div className="users-section">
            <h3>Katılımcılar ({roomUsers.length})</h3>
            <div className="users-list">
              {roomUsers.map(roomUser => (
                <div key={roomUser.userId} className="user-item">
                  <div className="user-avatar">
                    {roomUser.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-email">{roomUser.email}</span>
                  {roomUser.userId === user.id && <span className="you-label">(Sen)</span>}
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

      {/* Gizli audio element kullanıcının kendi sesi için */}
      <audio ref={userVideoRef} muted autoPlay style={{ display: 'none' }} />
    </div>
  );
};

export default Room;