import React, { useState, useEffect } from 'react';
import './Auth.css';
import './App.css';

function Dashboard({ user, token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const [addingUser, setAddingUser] = useState(false);

  const API_URL = 'https://trae-backend.onrender.com';

  // API çağrıları için header
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 401) {
        // Token geçersiz, çıkış yap
        onLogout();
      } else {
        setError('Kullanıcılar yüklenemedi');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  // Yeni kullanıcı ekle
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const addedUser = await response.json();
        setUsers([...users, addedUser]);
        setNewUser({ email: '', password: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Kullanıcı eklenemedi');
      }
    } catch (error) {
      console.error('Add user error:', error);
      setError('Bağlantı hatası');
    } finally {
      setAddingUser(false);
    }
  };

  // Kullanıcı sil (sadece admin)
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        setError('Kullanıcı silinemedi');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setError('Bağlantı hatası');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserInitials = (email) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="app">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials(user.email)}
          </div>
          <div className="user-details">
            <h3>Hoş geldin!</h3>
            <p>{user.email}</p>
            <span className={`user-role ${user.role}`}>{user.role}</span>
          </div>
        </div>
        <button onClick={onLogout} className="logout-button">
          🚪 Çıkış Yap
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Yeni Kullanıcı Ekleme Formu */}
      <div className="user-form">
        <h2>👤 Yeni Kullanıcı Ekle</h2>
        <form onSubmit={handleAddUser}>
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            required
            disabled={addingUser}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            required
            disabled={addingUser}
          />
          <button type="submit" disabled={addingUser}>
            {addingUser ? 'Ekleniyor...' : '➕ Kullanıcı Ekle'}
          </button>
        </form>
      </div>

      {/* Kullanıcı Listesi */}
      <div className="user-list">
        <h2>👥 Kullanıcılar ({users.length})</h2>
        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <div className="users-grid">
            {users.map(u => (
              <div key={u.id} className="user-card">
                <div className="user-avatar">
                  {getUserInitials(u.email)}
                </div>
                <div className="user-info-card">
                  <h3>{u.email}</h3>
                  <p>ID: {u.id}</p>
                  <span className={`user-role ${u.role}`}>{u.role}</span>
                  <p className="user-date">
                    📅 {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  {user.role === 'admin' && u.id !== user.id && (
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="delete-button"
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;