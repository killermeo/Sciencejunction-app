import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    axios
      .get('/tests/active')
      .then((res) => {
        if (isMounted) {
          setTests(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {
        if (isMounted) setTests([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStart = (test) => {
    localStorage.setItem('selectedTest', JSON.stringify(test));
    navigate('/quiz');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7FF' }}>
      <div
        style={{
          width: '220px',
          background: 'linear-gradient(180deg, #0F1C3F, #162447)',
          color: 'white',
          padding: '24px 16px',
        }}
      >
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
          {[
            ['🏠', 'Dashboard', '/dashboard'],
            ['📝', 'Daily Tests', '/tests'],
            ['🤖', 'AI Practice', '/practice'],
            ['📊', 'Analytics', '/analytics'],
            ['🏆', 'Leaderboard', '/leaderboard'],
          ].map(([icon, label, path]) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '8px',
                cursor: 'pointer',
                background: window.location.pathname === path ? 'rgba(255,255,255,0.15)' : 'transparent',
              }}
            >
              {icon} {label}
            </div>
          ))}
        </nav>
      </div>

      <div style={{ flex: 1, padding: '32px' }}>
        <h1 style={{ color: '#0F1C3F', marginBottom: '16px' }}>Active Tests</h1>

        {loading ? (
          <p style={{ color: '#64748B' }}>Loading tests...</p>
        ) : tests.length === 0 ? (
          <p style={{ color: '#64748B' }}>No active tests right now</p>
        ) : (
          tests.map((test) => (
            <div
              key={test._id}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <h3 style={{ color: '#0F1C3F', margin: 0 }}>{test.title || 'Untitled Test'}</h3>
              <p style={{ color: '#475569', margin: '8px 0' }}>
                {test.exam || 'Exam not specified'}
              </p>
              <p style={{ color: '#64748B', margin: '8px 0 14px' }}>
                Total questions: {test.questions?.length || 0}
              </p>
              <button
                type="button"
                onClick={() => handleStart(test)}
                style={{
                  padding: '8px 20px',
                  background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Start
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tests;
