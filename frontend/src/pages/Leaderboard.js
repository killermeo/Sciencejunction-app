import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Leaderboard() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = () => {
    setLoading(true);
    axios
      .get('http://localhost:5000/api/results/all')
      .then((res) => {
        setResults(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const topStudents = useMemo(() => {
    const byStudent = results.reduce((acc, row) => {
      const key = row.studentId || row.studentName || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          studentName: row.studentName || 'Unknown',
          score: 0,
        };
      }
      acc[key].score += Number(row.finalScore || 0);
      return acc;
    }, {});

    return Object.values(byStudent)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((student, idx) => ({
        rank: idx + 1,
        studentName: student.studentName,
        score: Number(student.score.toFixed(2)),
      }));
  }, [results]);

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: '#0F1C3F', margin: 0 }}>Top 20 Leaderboard</h1>
          <button
            type="button"
            onClick={fetchLeaderboard}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              color: 'white',
              background: 'linear-gradient(to right, #F59E0B, #EF4444)',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>

        <div
          style={{
            marginTop: '20px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <p style={{ margin: 0, padding: '16px', color: '#64748B' }}>Loading leaderboard...</p>
          ) : topStudents.length === 0 ? (
            <p style={{ margin: 0, padding: '16px', color: '#64748B' }}>No leaderboard data available.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#EEF2FF', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: '#0F1C3F', fontSize: '14px' }}>Rank</th>
                  <th style={{ padding: '12px', color: '#0F1C3F', fontSize: '14px' }}>Student Name</th>
                  <th style={{ padding: '12px', color: '#0F1C3F', fontSize: '14px' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student) => (
                  <tr key={`${student.studentName}-${student.rank}`} style={{ borderTop: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px', color: '#334155' }}>{student.rank}</td>
                    <td style={{ padding: '12px', color: '#0F172A', fontWeight: 600 }}>{student.studentName}</td>
                    <td style={{ padding: '12px', color: '#1E293B' }}>{student.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
