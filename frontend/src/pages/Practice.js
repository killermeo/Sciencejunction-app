import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Practice = () => {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem('student') || '{}');

  const [formData, setFormData] = useState({
    subject: '',
    chapter: '',
    examType: 'JEE',
    questionCount: 10,
    language: 'English'  // NEW — default English
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const examTypes = ['JEE', 'NEET', 'NDA', 'UPSC', 'CUET', 'Class 9-10', 'Class 11-12'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Language toggle handler
  const handleLanguage = (lang) => {
    setFormData({ ...formData, language: lang });
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.chapter) {
      setError('Subject और Chapter भरना जरूरी है');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/questions/generate', formData);
      const { questions, language } = response.data;

      // Quiz data save करो
      localStorage.setItem('quizQuestions', JSON.stringify(questions));
      localStorage.setItem('quizConfig', JSON.stringify({
        subject: formData.subject,
        chapter: formData.chapter,
        examType: formData.examType,
        language: language,
        studentId: student._id,
        studentName: student.name
      }));

      navigate('/quiz');
    } catch (err) {
      setError('Questions generate नहीं हुए। दोबारा try करो।');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>🤖 AI Practice Quiz</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>अपनी पसंद का topic चुनो और quiz शुरू करो</p>
      </div>

      {/* Form Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>

        {/* Subject */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>📚 Subject</label>
          <input
            type="text"
            name="subject"
            placeholder="जैसे: Physics, Chemistry, History..."
            value={formData.subject}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Chapter */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>📖 Chapter / Topic</label>
          <input
            type="text"
            name="chapter"
            placeholder="जैसे: Newton's Laws, Modern History..."
            value={formData.chapter}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Exam Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>🎯 Exam Type</label>
          <select
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            style={inputStyle}
          >
            {examTypes.map(exam => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
        </div>

        {/* Question Count */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>🔢 Questions की संख्या</label>
          <select
            name="questionCount"
            value={formData.questionCount}
            onChange={handleChange}
            style={inputStyle}
          >
            {[5, 10, 15, 20, 25, 30].map(n => (
              <option key={n} value={n}>{n} Questions</option>
            ))}
          </select>
        </div>

        {/* ===== LANGUAGE TOGGLE — NEW ===== */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>🌐 Question Language</label>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>

            {/* English Button */}
            <button
              onClick={() => handleLanguage('English')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: formData.language === 'English'
                  ? '2px solid #F59E0B'
                  : '2px solid #E5E7EB',
                background: formData.language === 'English'
                  ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                  : '#F9FAFB',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                color: formData.language === 'English' ? '#92400E' : '#6B7280',
                transition: 'all 0.2s'
              }}
            >
              🇬🇧 English
            </button>

            {/* Hindi Button */}
            <button
              onClick={() => handleLanguage('Hindi')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: formData.language === 'Hindi'
                  ? '2px solid #EF4444'
                  : '2px solid #E5E7EB',
                background: formData.language === 'Hindi'
                  ? 'linear-gradient(135deg, #FEE2E2, #FECACA)'
                  : '#F9FAFB',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                color: formData.language === 'Hindi' ? '#991B1B' : '#6B7280',
                transition: 'all 0.2s'
              }}
            >
              🇮🇳 हिंदी
            </button>

          </div>
          {/* Language info message */}
          <p style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#9CA3AF',
            textAlign: 'center'
          }}>
            {formData.language === 'Hindi'
              ? '✅ Questions हिंदी में आएंगे'
              : '✅ Questions English में आएंगे'}
          </p>
        </div>
        {/* ===== LANGUAGE TOGGLE END ===== */}

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading
              ? '#D1D5DB'
              : 'linear-gradient(135deg, #F59E0B, #EF4444)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {loading ? '⏳ Questions Generate हो रहे हैं...' : '🚀 Quiz शुरू करो'}
        </button>

        {loading && (
          <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '12px', fontSize: '13px' }}>
            AI questions बना रहा है — 10-20 seconds लगेंगे...
          </p>
        )}
      </div>
    </div>
  );
};

// Styles
const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  color: '#374151',
  fontSize: '14px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '2px solid #E5E7EB',
  borderRadius: '10px',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Hind, sans-serif',
  color: '#1F2937',
  background: '#FAFAFA'
};

export default Practice;
