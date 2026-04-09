const express = require('express');
const router = express.Router();
router.post('/generate', async (req, res) => {
const { subject, chapter, examType, questionCount, language, classLevel, stream } = req.body;
const isHindi = language === 'Hindi';
const languageInstruction = isHindi
? 'IMPORTANT: Generate ALL questions, options, and explanations in Hindi language (Devanagari script).'
: 'Generate all questions, options, and explanations in English language.';
const prompt = 'You are an expert CBSE exam question generator.\n\n' + languageInstruction + '\n\nGenerate exactly ' + questionCount + ' multiple choice questions for:\n- Class: ' + (classLevel || '') + '\n- Stream: ' + (stream || 'N/A') + '\n- Subject: ' + subject + '\n- Chapter/Topic: ' + chapter + '\n- Exam Pattern: ' + examType + '\n\nIMPORTANT RULES:\n1. Each question must have exactly 4 options (A, B, C, D)\n2. Add a brief explanation for each answer\n3. Questions must match ' + examType + ' difficulty level\n' + (isHindi ? '4. सभी questions, options और explanations हिंदी में होने चाहिए' : '') + '\n\nReturn ONLY a valid JSON array. Start with [ and end with ].\n[\n  {\n    "question": "Question text here",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "correctAnswer": 0,\n    "explanation": "Brief explanation here"\n  }\n]';
try {
console.log('API KEY exists:', !!process.env.GROQ_API_KEY);
  console.log('Request body:', JSON.stringify(req.body));
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
'Content-Type': 'application/json'
},
body: JSON.stringify({
model: 'llama-3.3-70b-versatile',
messages: [{ role: 'user', content: prompt }],
max_tokens: 4000,
temperature: 0.7
})
});
const data = await response.json();

if (!data.choices || !data.choices[0]) {
  return res.status(500).json({ error: 'Groq API error', details: data });
}

let content = data.choices[0].message.content.trim();
content = content.replace(/```json/gi, '').replace(/```/g, '').trim();

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']');

if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
  return res.status(500).json({ error: 'Invalid response format from AI' });
}

const jsonString = content.substring(startIndex, endIndex + 1);

let questions;
try {
  questions = JSON.parse(jsonString);
} catch (parseErr) {
  return res.status(500).json({ error: 'AI response parse नहीं हो सका। दोबारा try करो।' });
}

if (!Array.isArray(questions) || questions.length === 0) {
  return res.status(500).json({ error: 'Questions generate नहीं हुए। दोबारा try करो।' });
}

res.json({ questions, language: language || 'English' });
} catch (error) {
console.error('Error generating questions:', error);
res.status(500).json({ error: 'Failed to generate questions', details: error.message });
}
});
module.exports = router;
