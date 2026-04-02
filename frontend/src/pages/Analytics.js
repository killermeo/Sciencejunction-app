import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function Analytics() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const student = useMemo(() => {
    try {
      const raw = localStorage.getItem('student');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const studentId = student?._id || student?.id || null;

  const fetchResults = () => {
    if (!studentId) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/results/student/${studentId}`)
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
    if (!student) {
      navigate('/');
      return;
    }
    fetchResults();
  }, [navigate, student, fetchResults]);

  const chapterData = useMemo(() => {
    const grouped = results.reduce((acc, item) => {
      const chapter = item.chapter || 'General';
      if (!acc[chapter]) {
        acc[chapter] = { chapter, totalPct: 0, attempts: 0 };
      }

      acc[chapter].totalPct += Number(item.pct || 0);
      acc[chapter].attempts += 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((entry) => ({
        chapter: entry.chapter,
        avgScore: Number((entry.totalPct / entry.attempts).toFixed(1)),
        attempts: entry.attempts,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
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
          <div>
            <h1 style={{ color: '#0F1C3F', margin: 0 }}>Chapter-wise Analytics</h1>
            <p style={{ color: '#64748B', margin: '8px 0 0' }}>
              Student: {student?.name || 'Student'}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchResults}
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
            padding: '20px',
            height: '440px',
          }}
        >
          {loading ? (
            <p style={{ color: '#64748B' }}>Loading analytics...</p>
          ) : chapterData.length === 0 ? (
            <p style={{ color: '#64748B' }}>No result data available for chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chapterData} margin={{ top: 10, right: 24, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="chapter"
                  angle={-18}
                  textAnchor="end"
                  interval={0}
                  height={70}
                  tick={{ fill: '#334155', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#334155', fontSize: 12 }}
                  label={{ value: 'Avg %', angle: -90, position: 'insideLeft', fill: '#334155' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0' }}
                  formatter={(value, name) => {
                    if (name === 'avgScore') return [`${value}%`, 'Average Score'];
                    return [value, 'Attempts'];
                  }}
                />
                <Bar dataKey="avgScore" name="avgScore" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
