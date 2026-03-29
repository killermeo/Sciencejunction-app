import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Result() {
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState('idle');

  const quizResult = useMemo(() => {
    try {
      const raw = localStorage.getItem('quizResult');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const student = useMemo(() => {
    try {
      const raw = localStorage.getItem('student');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!quizResult) {
      navigate('/tests');
      return;
    }

    const payload = {
      studentName: student?.name || 'Guest',
      fatherName: student?.fatherName || '—',
      studentId: student?._id || student?.id || '—',
      testTitle: quizResult.title || 'Untitled Test',
      exam: quizResult.exam || 'Unknown Exam',
      chapter: quizResult.chapter || 'General',
      total: Number(quizResult.totalQuestions || 0),
      correct: Number(quizResult.correct || 0),
      wrong: Number(quizResult.wrong || 0),
      skipped: Number(quizResult.unanswered || 0),
      pct:
        (Number(quizResult.totalQuestions || 0) > 0
          ? (Number(quizResult.correct || 0) / Number(quizResult.totalQuestions || 1)) * 100
          : 0),
      finalScore: Number(quizResult.score || 0),
      negMarking: Number(quizResult.marking?.negative || 0) > 0,
      isDaily: true,
    };

    setSaveStatus('saving');
    axios
      .post('http://localhost:5000/api/results/save', payload)
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('error'));
  }, [navigate, quizResult, student]);

  if (!quizResult) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F4F7FF',
        padding: '32px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          padding: '28px',
        }}
      >
        <h1 style={{ margin: 0, color: '#0F1C3F' }}>Quiz Result</h1>
        <p style={{ margin: '8px 0 22px', color: '#64748B' }}>
          {quizResult.title} • {quizResult.exam}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '22px',
          }}
        >
          <div style={{ background: '#EEF2FF', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: '#475569', fontSize: '13px' }}>Total Score</div>
            <div style={{ color: '#0F1C3F', fontSize: '22px', fontWeight: 700 }}>
              {quizResult.score ?? 0}
            </div>
          </div>
          <div style={{ background: '#ECFDF3', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: '#475569', fontSize: '13px' }}>Correct answers</div>
            <div style={{ color: '#14532D', fontSize: '22px', fontWeight: 700 }}>
              {quizResult.correct ?? 0}
            </div>
          </div>
          <div style={{ background: '#FEF2F2', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: '#475569', fontSize: '13px' }}>Wrong answers</div>
            <div style={{ color: '#991B1B', fontSize: '22px', fontWeight: 700 }}>
              {quizResult.wrong ?? 0}
            </div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: '#475569', fontSize: '13px' }}>Skipped questions</div>
            <div style={{ color: '#0F172A', fontSize: '22px', fontWeight: 700 }}>
              {quizResult.unanswered ?? 0}
            </div>
          </div>
        </div>

        <div
          style={{
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '18px',
          }}
        >
          <h3 style={{ margin: '0 0 10px', color: '#0F1C3F' }}>Negative marking breakdown</h3>
          <p style={{ margin: '0 0 6px', color: '#334155' }}>
            Rule: +{quizResult.marking?.positive ?? 1} / -{quizResult.marking?.negative ?? 0}
          </p>
          <p style={{ margin: 0, color: '#334155' }}>
            Calculated score = ({quizResult.correct ?? 0} × {quizResult.marking?.positive ?? 1})
            {' - '}
            ({quizResult.wrong ?? 0} × {quizResult.marking?.negative ?? 0}) = {quizResult.score ?? 0}
          </p>
        </div>

        <p style={{ margin: '0 0 20px', color: '#64748B' }}>
          {saveStatus === 'saving' && 'Saving result to server...'}
          {saveStatus === 'saved' && 'Result saved successfully.'}
          {saveStatus === 'error' && 'Could not save result to server right now.'}
        </p>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            background: 'linear-gradient(to right, #F59E0B, #EF4444)',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Result;
