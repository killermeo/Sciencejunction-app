import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('student'));
    if (!s) window.location.href = '/';
    setStudent(s);
    API.get('/tests/active').then(res => setTests(res.data)).catch(() => {});
  }, []);

  const handleStartTest = (test) => {
    localStorage.setItem('selectedTest', JSON.stringify(test));
    navigate(`/quiz/${test._id}`);
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F4F7FF' }}>
      {/* Sidebar */}
      <div style={{ width:'220px', background:'linear-gradient(180deg, #0F1C3F, #162447)', color:'white', padding:'24px 16px' }}>
        <h2
          style={{
            fontSize: '18px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
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
        <nav>
          {[['🏠','Dashboard','/dashboard'],['📝','Daily Tests','/tests'],['🤖','AI Practice','/practice'],['📊','Analytics','/analytics'],['🏆','Leaderboard','/leaderboard']].map(([icon, label, path]) => (
            <div key={path} onClick={() => window.location.href = path}
              style={{ padding:'10px 12px', borderRadius:'8px', marginBottom:'8px', cursor:'pointer', background: window.location.pathname === path ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
              {icon} {label}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex:1, padding:'32px' }}>
        <h1 style={{ color:'#0F1C3F', marginBottom:'8px' }}>नमस्ते, {student?.name} 👋</h1>
        <p style={{ color:'#666', marginBottom:'32px' }}>आज क्या पढ़ना है?</p>

        {/* Active Tests */}
        <h2 style={{ color:'#0F1C3F', marginBottom:'16px' }}>📋 Active Tests</h2>
        {tests.length === 0 ? (
          <p style={{ color:'#888' }}>अभी कोई test available नहीं है।</p>
        ) : (
          tests.map(test => (
            <div key={test._id} style={{ background:'white', padding:'20px', borderRadius:'12px', marginBottom:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color:'#0F1C3F', margin:0 }}>{test.title}</h3>
              <p style={{ color:'#666', margin:'8px 0' }}>{test.exam} • {test.questions?.length} Questions</p>
              <button onClick={() => handleStartTest(test)}
                style={{ padding:'8px 20px', background:'linear-gradient(to right, #F59E0B, #EF4444)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' }}>
                Start Test
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;