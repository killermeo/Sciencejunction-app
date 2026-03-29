import React, { useState } from 'react';
import API from '../services/api';

function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await API.post('/auth/login', { studentId, password });
      localStorage.setItem('student', JSON.stringify(res.data.student));
      window.location.href = '/dashboard';
    } catch (err) {
      setError('गलत ID या Password');
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#F4F7FF' }}>
      <div style={{ background:'white', padding:'40px', borderRadius:'12px', width:'350px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2
          style={{
            textAlign: 'center',
            color: '#0F1C3F',
            marginBottom: '24px',
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
        <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)}
          style={{ width:'100%', padding:'12px', marginBottom:'12px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' }} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width:'100%', padding:'12px', marginBottom:'12px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' }} />
        {error && <p style={{ color:'red', textAlign:'center' }}>{error}</p>}
        <button onClick={handleLogin}
          style={{ width:'100%', padding:'12px', background:'linear-gradient(to right, #F59E0B, #EF4444)', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' }}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;