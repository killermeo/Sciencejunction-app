import React, { useState } from 'react';
import API from '../services/api';

function TeacherLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await API.post('/auth/teacher', { password });
      localStorage.setItem('teacher', JSON.stringify(res.data));
      window.location.href = '/teacher-dashboard';
    } catch (err) {
      setError('गलत Password');
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#F4F7FF' }}>
      <div style={{ background:'white', padding:'40px', borderRadius:'12px', width:'350px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2
          style={{
            textAlign: 'center',
            color: '#0F1C3F',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: 0,
          }}
        >
          <span
            style={{
              backgroundImage: 'linear-gradient(to right, #F59E0B, #EF4444)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            ⚗
          </span>
          <span>Science Junction</span>
        </h2>
        <p style={{ textAlign:'center', color:'#666', marginBottom:'24px' }}>Teacher Login</p>
        <input placeholder="Teacher Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width:'100%', padding:'12px', marginBottom:'12px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' }} />
        {error && <p style={{ color:'red', textAlign:'center' }}>{error}</p>}
        <button onClick={handleLogin}
          style={{ width:'100%', padding:'12px', background:'linear-gradient(to right, #F59E0B, #EF4444)', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' }}>
          Login
        </button>
        <p style={{ textAlign:'center', marginTop:'16px' }}>
          <a href="/" style={{ color:'#0F1C3F', fontSize:'14px' }}>← Student Login</a>
        </p>
      </div>
    </div>
  );
}

export default TeacherLogin;