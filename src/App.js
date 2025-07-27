import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://trae-backend.onrender.com';

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Kullanıcılar getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Yeni kullanıcı ekle
  const addUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      alert('Email ve şifre gerekli!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers([...users, data]);
        setNewUser({ email: '', password: '' });
        alert('Kullanıcı başarıyla eklendi!');
      } else {
        alert('Kullanıcı eklenemedi!');
      }
    } catch (error) {
      console.error('Kullanıcı eklenemedi:', error);
      alert('Hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde kullanıcıları getir
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Trae Backend - Kullanıcı Yönetimi</h1>
        
        {/* Yeni Kullanıcı Ekleme Formu */}
        <div className="user-form">
          <h2>Yeni Kullanıcı Ekle</h2>
          <form onSubmit={addUser}>
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Şifre"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
            </button>
          </form>
        </div>

        {/* Kullanıcı Listesi */}
        <div className="user-list">
          <h2>Kullanıcılar ({users.length})</h2>
          <button onClick={fetchUsers} disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
          
          {loading ? (
            <p>Yükleniyor...</p>
          ) : (
            <div className="users">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Tarih:</strong> {new Date(user.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
