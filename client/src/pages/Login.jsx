import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { API } from '../services/api';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('Vui lòng nhập User ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Vì hệ thống cũ dùng Session PHP, chúng ta tạm giả lập Login bằng cách fetch User theo ID
      const res = await fetch(`http://localhost:3000/api/v1/users/user-by-id/${userId}`);
      const data = await res.json();
      
      if (data && data.userId) {
        login({
          userId: data.userId,
          name: data.name || data.fullname || `User ${data.userId}`,
          email: data.email || ''
        });
        navigate('/');
      } else {
        setError('User không tồn tại!');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-dark)' }}>Đăng nhập</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          *Bản demo SPA: Vui lòng nhập ID người dùng (ví dụ: 1 hoặc 2)
        </p>
        
        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>User ID</label>
            <input 
              type="number" 
              className="input-field" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)} 
              placeholder="Nhập User ID..."
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
