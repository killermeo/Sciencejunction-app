import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';

const MAX_TAB_WARNINGS = 3;

const getMarkingRules = (examName = '') => {
  const exam = examName.toUpperCase();

  if (exam.includes('JEE') || exam.includes('NEET')) {
    return { positive: 4, negative: 1, label: '+4 / -1' };
  }
  if (exam.includes('NDA')) {
    return { positive: 2.5, negative: 0.833, label: '+2.5 / -0.833' };
  }
  if (exam.includes('CLAT') || exam.includes('CA')) {
    return { positive: 1, negative: 0.25, label: '+1 / -0.25' };
  }
  if (exam.includes('CUET')) {
    return { positive: 1, negative: 0.2, label: '+1 / -0.2' };
  }

  return { positive: 1, negative: 0, label: '+1 / No negative' };
};

const formatTime = (seconds) => {
  const safe = Math.max(seconds, 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

function Quiz() {
  const navigate = useNavigate();
  const { id: testId } = useParams();
  const submittedRef = useRef(false);

  const [selectedTest, setSelectedTest] = useState(null);
  const [loadingTest, setLoadingTest] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTest = async () => {
      setLoadingTest(true);
      try {
        let fromStorage = null;
        try {
          const raw = localStorage.getItem('selectedTest');
          fromStorage = raw ? JSON.parse(raw) : null;
        } catch {
          fromStorage = null;
        }

        if (fromStorage && (!testId || fromStorage._id === testId)) {
          if (isMounted) setSelectedTest(fromStorage);
          return;
        }

        if (testId) {
          const res = await API.get('/tests/active');
          const tests = Array.isArray(res.data) ? res.data : [];
          const matched = tests.find((t) => t?._id === testId);
          if (matched) {
            localStorage.setItem('selectedTest', JSON.stringify(matched));
            if (isMounted) setSelectedTest(matched);
            return;
          }
        }

        if (fromStorage) {
          if (isMounted) setSelectedTest(fromStorage);
          return;
        }

        if (isMounted) {
          setSelectedTest(null);
        }
      } catch {
        if (isMounted) {
          setSelectedTest(null);
        }
      } finally {
        if (isMounted) setLoadingTest(false);
      }
    };

    loadTest();
    return () => {
      isMounted = false;
    };
  }, [testId]);

  const questions = useMemo(() => selectedTest?.questions || [], [selectedTest]);
  const rules = getMarkingRules(selectedTest?.exam || '');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(() => (selectedTest?.timeLimit || 30) * 60);
  const [tabWarnings, setTabWarnings] = useState(0);

  // Refs keep `submitQuiz` stable without resubscribing timer/listeners on every answer change.
  const selectedTestRef = useRef(selectedTest);
  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);
  const rulesRef = useRef(rules);
  const tabWarningsRef = useRef(tabWarnings);

  useEffect(() => {
    selectedTestRef.current = selectedTest;
  }, [selectedTest]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

  useEffect(() => {
    tabWarningsRef.current = tabWarnings;
  }, [tabWarnings]);

  useEffect(() => {
    setCurrentIndex(0);
    const nextAnswers = Array(questions.length).fill(null);
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    setTimeLeft((selectedTest?.timeLimit || 30) * 60);
    setTabWarnings(0);
    submittedRef.current = false;
  }, [questions.length, selectedTest?.timeLimit]);

  const submitQuiz = useCallback(
    (reason = 'manual') => {
      const sel = selectedTestRef.current;
      if (submittedRef.current || !sel) return;
      submittedRef.current = true;

      const qs = questionsRef.current;
      const currentAnswers = answersRef.current;
      const currentRules = rulesRef.current;
      const currentWarnings = tabWarningsRef.current;

      let correct = 0;
      let wrong = 0;
      let unanswered = 0;

      qs.forEach((question, idx) => {
        const userAnswer = currentAnswers[idx];
        if (userAnswer === null || userAnswer === undefined) {
          unanswered += 1;
          return;
        }

        if (userAnswer === question.ans) {
          correct += 1;
        } else {
          wrong += 1;
        }
      });

      const attempted = correct + wrong;
      const score = correct * currentRules.positive - wrong * currentRules.negative;
      const maxScore = qs.length * currentRules.positive;

      const quizResult = {
        testId: sel._id || null,
        title: sel.title || 'Untitled Test',
        exam: sel.exam || 'Unknown Exam',
        submittedBy: reason,
        totalQuestions: qs.length,
        attempted,
        correct,
        wrong,
        unanswered,
        score: Number(score.toFixed(3)),
        maxScore: Number(maxScore.toFixed(3)),
        marking: currentRules,
        warningsUsed: currentWarnings,
        submittedAt: new Date().toISOString(),
        answers: currentAnswers,
      };

      localStorage.setItem('quizResult', JSON.stringify(quizResult));
      navigate('/result');
    },
    [navigate],
  );

  useEffect(() => {
    if (!loadingTest && (!selectedTest || questions.length === 0)) {
      navigate('/tests');
    }
  }, [loadingTest, navigate, questions.length, selectedTest]);

  useEffect(() => {
    if (!selectedTest) return undefined;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          submitQuiz('timer');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [selectedTest, submitQuiz]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarnings((prev) => {
          const next = prev + 1;
          if (next >= MAX_TAB_WARNINGS) {
            submitQuiz('tab-switch-limit');
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submitQuiz]);

  if (loadingTest) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#475569' }}>
        Loading test...
      </div>
    );
  }

  if (!selectedTest || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const selectedOption = answers[currentIndex];

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
            marginBottom: '20px',
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
        <p style={{ margin: '0 0 10px', fontSize: '14px', opacity: 0.9 }}>
          {selectedTest.title || 'Quiz'}
        </p>
        <p style={{ margin: '0 0 18px', fontSize: '13px', opacity: 0.85 }}>
          Marking: {rules.label}
        </p>
        <div
          style={{
            background: 'rgba(255,255,255,0.14)',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '12px', opacity: 0.85 }}>Time Left</div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>{formatTime(timeLeft)}</div>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.14)',
            borderRadius: '10px',
            padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: '12px', opacity: 0.85 }}>Tab Warnings</div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>
            {tabWarnings}/{MAX_TAB_WARNINGS}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            padding: '24px',
            maxWidth: '820px',
          }}
        >
          <p style={{ color: '#64748B', margin: 0 }}>
            Question {currentIndex + 1} of {questions.length}
          </p>
          <h2 style={{ color: '#0F1C3F', marginTop: '8px' }}>{currentQuestion?.q}</h2>

          <div style={{ marginTop: '16px' }}>
            {(currentQuestion?.opts || []).map((option, optionIdx) => (
              <button
                key={optionIdx}
                type="button"
                onClick={() => {
                  setAnswers((prev) => {
                    const next = [...prev];
                    next[currentIndex] = optionIdx;
                    answersRef.current = next;
                    return next;
                  });
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border:
                    selectedOption === optionIdx ? '2px solid #0F1C3F' : '1px solid #D9E1F2',
                  marginBottom: '10px',
                  background: selectedOption === optionIdx ? '#EEF2FF' : '#FFFFFF',
                  color: '#1E293B',
                  cursor: 'pointer',
                }}
              >
                {String.fromCharCode(65 + optionIdx)}. {option}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#fff',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.6 : 1,
              }}
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))
                }
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  color: 'white',
                  background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                  cursor: 'pointer',
                }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submitQuiz('manual')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  color: 'white',
                  background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                  cursor: 'pointer',
                }}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
