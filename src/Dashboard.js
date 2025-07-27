import React, { useState } from 'react';
import RoomList from './RoomList';
import Room from './Room';

const Dashboard = ({ user, onLogout }) => {
  const [currentRoom, setCurrentRoom] = useState(null);

  const handleJoinRoom = (roomId) => {
    setCurrentRoom(roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  if (currentRoom) {
    return (
      <Room 
        roomId={currentRoom}
        user={user}
        onLeave={handleLeaveRoom}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* User Info Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '15px 20px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: 100
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.email}</div>
          <div style={{ fontSize: '12px', opacity: '0.7' }}>{user.role}</div>
        </div>
        <button 
          onClick={onLogout}
          style={{
            padding: '8px 15px',
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#ff3742'}
          onMouseOut={(e) => e.target.style.background = '#ff4757'}
        >
          Çıkış
        </button>
      </div>

      <RoomList user={user} onJoinRoom={handleJoinRoom} />
    </div>
  );
};

export default Dashboard;