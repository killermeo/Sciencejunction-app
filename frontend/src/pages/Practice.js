import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const CATEGORIES = {
  'Class 9-12': ['Science', 'Mathematics', 'Commerce', 'Agriculture', 'Arts'],
  'Competitive Exams': ['JEE / IIT', 'NEET', 'CUET', 'CLAT', 'NDA', 'CA / CMA / CS'],
};

const layout = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: '#0a1628',
    color: '#e2e8f0',
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
  },
  sidebarTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    margin: 0,
    marginBottom: '0.5rem',
  },
  sidebarText: {
    margin: 0,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: '#94a3b8',
  },
  main: {
    flex: 1,
    padding: '2.5rem clamp(1.5rem, 4vw, 3rem)',
    background: '#f1f5f9',
    boxSizing: 'border-box',
  },
  card: {
    maxWidth: 520,
    background: '#fff',
    borderRadius: 12,
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.06)',
  },
  heading: {
    margin: '0 0 1.75rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  field: {
    marginBottom: '1.35rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '0.45rem',
  },
  select: {
    width: '100%',
    padding: '0.65rem 0.75rem',
    fontSize: '0.9375rem',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#0f172a',
    boxSizing: 'border-box',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.75rem',
    fontSize: '0.9375rem',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxSizing: 'border-box',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  slider: {
    flex: 1,
    accentColor: '#ea580c',
  },
  countBadge: {
    minWidth: 40,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '0.9375rem',
    color: '#0f172a',
  },
  startBtn: {
    width: '100%',
    marginTop: '0.5rem',
    padding: '0.85rem 1.25rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
  },
};

function Practice() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Class 9-12');
  const [subject, setSubject] = useState(() => CATEGORIES['Class 9-12'][0]);
  const [chapter, setChapter] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subjectOptions = useMemo(() => CATEGORIES[category] || [], [category]);

  const handleCategoryChange = (e) => {
    const next = e.target.value;
    setCategory(next);
    const first = CATEGORIES[next]?.[0] || '';
    setSubject(first);
  };

  const handleStart = () => {
    const topic = (chapter || '').trim() || 'General';
    const difficulty = '70% hard, 20% medium, 10% tricky';

    setLoading(true);
    setError('');

    API.post('/questions/generate', {
      exam: subject,
      chapter: topic,
      count: questionCount,
      lang: 'English',
      difficulty,
    })
      .then((res) => {
        const qs = Array.isArray(res.data?.questions) ? res.data.questions : [];
        if (!qs.length) {
          setError('No questions were generated. Please try again.');
          return;
        }

        localStorage.setItem(
          'selectedTest',
          JSON.stringify({
            title: 'Practice Test',
            exam: subject,
            chapter: topic,
            timeLimit: 30,
            questions: qs,
          }),
        );

        navigate('/quiz');
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || 'Could not generate questions. Please try again.';
        console.error('Practice generation failed:', err);
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={layout.root}>
      <aside style={layout.sidebar} aria-label="Practice navigation">
        <h2 style={layout.sidebarTitle}>Practice</h2>
        <p style={layout.sidebarText}>
          Configure your session, then start when you are ready.
        </p>
      </aside>

      <main style={layout.main}>
        <div style={layout.card}>
          <h1 style={layout.heading}>Start practice</h1>

          <div style={layout.field}>
            <label htmlFor="practice-category" style={layout.label}>
              Category
            </label>
            <select
              id="practice-category"
              style={layout.select}
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="Class 9-12">Class 9-12</option>
              <option value="Competitive Exams">Competitive Exams</option>
            </select>
          </div>

          <div style={layout.field}>
            <label htmlFor="practice-subject" style={layout.label}>
              Subject
            </label>
            <select
              id="practice-subject"
              style={layout.select}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {subjectOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div style={layout.field}>
            <label htmlFor="practice-chapter" style={layout.label}>
              Chapter
            </label>
            <input
              id="practice-chapter"
              type="text"
              style={layout.input}
              placeholder="e.g. Motion, Thermodynamics"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div style={layout.field}>
            <label htmlFor="practice-count" style={layout.label}>
              Number of questions
            </label>
            <div style={layout.sliderRow}>
              <input
                id="practice-count"
                type="range"
                style={layout.slider}
                min={5}
                max={50}
                step={5}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
              <span style={layout.countBadge} aria-live="polite">
                {questionCount}
              </span>
            </div>
          </div>

          <button type="button" style={layout.startBtn} onClick={handleStart} disabled={loading}>
            {loading ? 'Generating...' : 'Start'}
          </button>
          {error && <p style={{ margin: '12px 0 0', color: '#B91C1C' }}>{error}</p>}
        </div>
      </main>
    </div>
  );
}

export default Practice;
