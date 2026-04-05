import React, { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function TeacherDashboard() {
  const navigate = useNavigate();

  const [genForm, setGenForm] = useState({
    subject: '',
    chapter: '',
    exam: '',
    count: 10,
    lang: 'English',
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  const [publishForm, setPublishForm] = useState({
    title: '',
    exam: '',
    timeLimit: 30,
  });
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');

  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    father: '',
    id: '',
    password: '',
  });
  const [studentActionLoading, setStudentActionLoading] = useState(false);

  const fetchResults = () => {
    setResultsLoading(true);
    API
      .get('http://localhost:5000/api/results/all')
      .then((res) => setResults(Array.isArray(res.data) ? res.data : []))
      .catch(() => setResults([]))
      .finally(() => setResultsLoading(false));
  };

  const fetchStudents = () => {
    setStudentsLoading(true);
    API
      .get('http://localhost:5000/api/auth/students')
      .then((res) => setStudents(Array.isArray(res.data) ? res.data : []))
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
  };

  useEffect(() => {
    fetchResults();
    fetchStudents();
  }, []);

  const generatedPreview = useMemo(() => generatedQuestions.slice(0, 10), [generatedQuestions]);

  const handleGenerateQuestions = (e) => {
    e.preventDefault();
    setGenLoading(true);
    setGenError('');

    API
      .post('http://localhost:5000/api/questions/generate', {
        subject: genForm.subject,
        chapter: genForm.chapter,
        exam: genForm.exam,
        count: Number(genForm.count),
        lang: genForm.lang,
      })
      .then((res) => {
        const qs = Array.isArray(res.data?.questions) ? res.data.questions : [];
        setGeneratedQuestions(qs);
        if (!qs.length) {
          setGenError('No questions were generated. Please try again.');
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || 'Could not generate questions. Please try again.';
        console.error('Question generation failed:', err);
        setGenError(msg);
        setGeneratedQuestions([]);
      })
      .finally(() => setGenLoading(false));
  };

  const handlePublishTest = (e) => {
    e.preventDefault();
    setPublishLoading(true);
    setPublishMessage('');

    API
      .post('http://localhost:5000/api/tests/publish', {
        title: publishForm.title,
        exam: publishForm.exam,
        chapter: genForm.chapter || 'General',
        timeLimit: Number(publishForm.timeLimit),
        questions: generatedQuestions,
        negMarking: false,
        active: true,
      })
      .then(() => {
        setPublishMessage('Daily test published successfully.');
      })
      .catch(() => {
        setPublishMessage('Could not publish test. Please try again.');
      })
      .finally(() => setPublishLoading(false));
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    setStudentActionLoading(true);

    API
      .post('http://localhost:5000/api/auth/add-student', newStudent)
      .then(() => {
        setNewStudent({ name: '', father: '', id: '', password: '' });
        fetchStudents();
      })
      .catch(() => {})
      .finally(() => setStudentActionLoading(false));
  };

  const handleDeleteStudent = (studentId) => {
    if (!studentId) return;
    setStudentActionLoading(true);
    API
      .delete(`http://localhost:5000/api/auth/student/${encodeURIComponent(studentId)}`)
      .then(() => fetchStudents())
      .catch(() => {})
      .finally(() => setStudentActionLoading(false));
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
            ['🏫', 'Teacher Panel', '/teacher-dashboard'],
            ['📝', 'Daily Tests', '/tests'],
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

      <div style={{ flex: 1, padding: '28px', display: 'grid', gap: '18px' }}>
        <section style={{ background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#0F1C3F' }}>1. Generate Questions</h2>
          <form onSubmit={handleGenerateQuestions} style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <input
              placeholder="Subject"
              value={genForm.subject}
              onChange={(e) => setGenForm((p) => ({ ...p, subject: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <input
              placeholder="Chapter"
              value={genForm.chapter}
              onChange={(e) => setGenForm((p) => ({ ...p, chapter: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <input
              placeholder="Exam Type"
              value={genForm.exam}
              onChange={(e) => setGenForm((p) => ({ ...p, exam: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <input
              type="number"
              min={1}
              max={200}
              placeholder="No. of Questions"
              value={genForm.count}
              onChange={(e) => setGenForm((p) => ({ ...p, count: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <button
              type="submit"
              disabled={genLoading}
              style={{
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              {genLoading ? 'Generating...' : 'Generate'}
            </button>
          </form>

          <div style={{ marginTop: '14px' }}>
            {genError && <p style={{ color: '#B91C1C', marginTop: 0 }}>{genError}</p>}
            {generatedPreview.map((q, idx) => (
              <div key={idx} style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '10px' }}>
                <p style={{ margin: 0, color: '#0F1C3F', fontWeight: 600 }}>{idx + 1}. {q.q}</p>
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#475569' }}>
                  {(q.opts || []).map((opt, optIdx) => (
                    <li key={optIdx}>{opt}</li>
                  ))}
                </ul>
              </div>
            ))}
            {generatedQuestions.length > 10 && (
              <p style={{ color: '#64748B', marginTop: '10px' }}>
                Showing first 10 of {generatedQuestions.length} generated questions.
              </p>
            )}
          </div>
        </section>

        <section style={{ background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#0F1C3F' }}>2. Publish Daily Test</h2>
          <form onSubmit={handlePublishTest} style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            <input
              placeholder="Test title"
              value={publishForm.title}
              onChange={(e) => setPublishForm((p) => ({ ...p, title: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <input
              placeholder="Exam type"
              value={publishForm.exam}
              onChange={(e) => setPublishForm((p) => ({ ...p, exam: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <input
              type="number"
              min={1}
              placeholder="Time limit (min)"
              value={publishForm.timeLimit}
              onChange={(e) => setPublishForm((p) => ({ ...p, timeLimit: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <button
              type="submit"
              disabled={publishLoading}
              style={{
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              {publishLoading ? 'Publishing...' : 'Publish Test'}
            </button>
          </form>
          {publishMessage && <p style={{ marginBottom: 0, color: '#475569' }}>{publishMessage}</p>}
        </section>

        <section style={{ background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#0F1C3F' }}>3. View All Results</h2>
          {resultsLoading ? (
            <p style={{ color: '#64748B' }}>Loading results...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#EEF2FF', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Test</th>
                    <th style={{ padding: '10px' }}>Exam</th>
                    <th style={{ padding: '10px' }}>Score</th>
                    <th style={{ padding: '10px' }}>Correct</th>
                    <th style={{ padding: '10px' }}>Wrong</th>
                    <th style={{ padding: '10px' }}>Skipped</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr key={row._id} style={{ borderTop: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '10px' }}>{row.studentName}</td>
                      <td style={{ padding: '10px' }}>{row.testTitle}</td>
                      <td style={{ padding: '10px' }}>{row.exam}</td>
                      <td style={{ padding: '10px' }}>{row.finalScore}</td>
                      <td style={{ padding: '10px' }}>{row.correct}</td>
                      <td style={{ padding: '10px' }}>{row.wrong}</td>
                      <td style={{ padding: '10px' }}>{row.skipped}</td>
                    </tr>
                  ))}
                  {results.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '10px', color: '#64748B' }}>
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={{ background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#0F1C3F' }}>4. Manage Students</h2>
          <form onSubmit={handleAddStudent} style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            <input
              placeholder="Student name"
              value={newStudent.name}
              onChange={(e) => setNewStudent((p) => ({ ...p, name: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <input
              placeholder="Father name"
              value={newStudent.father}
              onChange={(e) => setNewStudent((p) => ({ ...p, father: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <input
              placeholder="Student ID"
              value={newStudent.id}
              onChange={(e) => setNewStudent((p) => ({ ...p, id: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <input
              placeholder="Password"
              type="text"
              value={newStudent.password}
              onChange={(e) => setNewStudent((p) => ({ ...p, password: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <button
              type="submit"
              disabled={studentActionLoading}
              style={{
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              Add Student
            </button>
          </form>

          <div style={{ marginTop: '14px', overflowX: 'auto' }}>
            {studentsLoading ? (
              <p style={{ color: '#64748B' }}>Loading students...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#EEF2FF', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Father</th>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id} style={{ borderTop: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '10px' }}>{s.name}</td>
                      <td style={{ padding: '10px' }}>{s.father}</td>
                      <td style={{ padding: '10px' }}>{s.id}</td>
                      <td style={{ padding: '10px' }}>
                        <button
                          type="button"
                          disabled={studentActionLoading}
                          onClick={() => handleDeleteStudent(s.id)}
                          style={{
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                            padding: '8px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '10px', color: '#64748B' }}>
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default TeacherDashboard;
