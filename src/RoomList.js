import React, { useState, useEffect } from 'react';
import './RoomList.css';

const RoomList = ({ user, onJoinRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxMembers: 10
  });
  const [activeTab, setActiveTab] = useState('public');

  useEffect(() => {
    fetchRooms();
    fetchMyRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://trae-backend.onrender.com/rooms/public', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        console.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://trae-backend.onrender.com/rooms/my-rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyRooms(data);
      } else {
        console.error('Failed to fetch my rooms');
      }
    } catch (error) {
      console.error('Error fetching my rooms:', error);
    }
  };

  const createRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://trae-backend.onrender.com/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoom)
      });
      
      if (response.ok) {
        const createdRoom = await response.json();
        setShowCreateForm(false);
        setNewRoom({ name: '', description: '', isPrivate: false, maxMembers: 10 });
        
        // Refresh room lists
        fetchRooms();
        fetchMyRooms();
        
        // Join the newly created room
        onJoinRoom(createdRoom.id);
      } else {
        const error = await response.json();
        alert(error.message || 'Room oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Room oluşturulurken hata oluştu');
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://trae-backend.onrender.com/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        onJoinRoom(roomId);
      } else {
        const error = await response.json();
        alert(error.message || 'Room\'a katılamadı');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Room\'a katılırken hata oluştu');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const RoomCard = ({ room, isOwner = false }) => (
    <div className="room-card">
      <div className="room-card-header">
        <h3>{room.name}</h3>
        {isOwner && <span className="owner-badge">Sahibi</span>}
        {room.isPrivate && <span className="private-badge">🔒</span>}
      </div>
      
      <p className="room-description">{room.description || 'Açıklama yok'}</p>
      
      <div className="room-stats">
        <span className="member-count">
          👥 {room.members?.length || 0}/{room.maxMembers}
        </span>
        <span className="created-date">
          📅 {new Date(room.createdAt).toLocaleDateString('tr-TR')}
        </span>
      </div>
      
      <div className="room-members">
        {room.members?.slice(0, 3).map(member => (
          <div key={member.id} className="member-avatar" title={member.user.email}>
            {member.user.email.charAt(0).toUpperCase()}
          </div>
        ))}
        {room.members?.length > 3 && (
          <div className="member-avatar more">
            +{room.members.length - 3}
          </div>
        )}
      </div>
      
      <button 
        onClick={() => isOwner ? onJoinRoom(room.id) : joinRoom(room.id)}
        className="join-btn"
        disabled={room.members?.length >= room.maxMembers}
      >
        {isOwner ? 'Gir' : room.members?.length >= room.maxMembers ? 'Dolu' : 'Katıl'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="room-list-loading">
        <div className="loading-spinner"></div>
        <p>Room'lar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h1>🎬 Film İzleme Odaları</h1>
        <p>Arkadaşlarınla birlikte film izle ve sohbet et!</p>
        
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="create-room-btn"
          >
            + Yeni Oda Oluştur
          </button>
        </div>
      </div>

      <div className="room-tabs">
        <button 
          className={`tab-btn ${activeTab === 'public' ? 'active' : ''}`}
          onClick={() => setActiveTab('public')}
        >
          🌍 Herkese Açık ({rooms.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'my-rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-rooms')}
        >
          🏠 Odalarım ({myRooms.length})
        </button>
      </div>

      <div className="room-list-content">
        {activeTab === 'public' && (
          <div className="rooms-grid">
            {rooms.length === 0 ? (
              <div className="no-rooms">
                <p>Henüz herkese açık oda yok. İlk odayı sen oluştur! 🚀</p>
              </div>
            ) : (
              rooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))
            )}
          </div>
        )}

        {activeTab === 'my-rooms' && (
          <div className="rooms-grid">
            {myRooms.length === 0 ? (
              <div className="no-rooms">
                <p>Henüz hiçbir odaya katılmadın. Hadi bir odaya katıl! 🎉</p>
              </div>
            ) : (
              myRooms.map(room => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  isOwner={room.ownerId === user.id}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>🎬 Yeni Oda Oluştur</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>Oda Adı *</label>
                <input
                  type="text"
                  name="name"
                  value={newRoom.name}
                  onChange={handleInputChange}
                  placeholder="Örn: Aksiyon Filmleri Gecesi"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  name="description"
                  value={newRoom.description}
                  onChange={handleInputChange}
                  placeholder="Bu oda hakkında kısa bir açıklama..."
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Maksimum Üye</label>
                  <input
                    type="number"
                    name="maxMembers"
                    value={newRoom.maxMembers}
                    onChange={handleInputChange}
                    min="2"
                    max="50"
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPrivate"
                      checked={newRoom.isPrivate}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Özel Oda (Sadece davet ile)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowCreateForm(false)}
                className="cancel-btn"
              >
                İptal
              </button>
              <button 
                onClick={createRoom}
                className="create-btn"
                disabled={!newRoom.name.trim()}
              >
                Oda Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;