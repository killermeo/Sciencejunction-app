const express = require('express');
const router = express.Router();

router.post('/generate', async (req, res) => {
  const { subject, chapter, examType, questionCount, language } = req.body;

  // Language instruction
  const isHindi = language === 'Hindi';
  const languageInstruction = isHindi
    ? `IMPORTANT: Generate ALL questions, options, and explanations in Hindi language (Devanagari script). Every single word must be in Hindi.`
    : `Generate all questions, options, and explanations in English language.`;

  const prompt = `You are an expert exam question generator for Indian competitive exams.

${languageInstruction}

Generate exactly ${questionCount} multiple choice questions for:
- Subject: ${subject}
- Chapter/Topic: ${chapter}
- Exam Type: ${examType}

IMPORTANT RULES:
1. First assess the chapter size. If the chapter is small/narrow, cap questions at 15-20 max. Never generate low quality or repeated questions just to fill count.
2. Each question must have exactly 4 options (A, B, C, D)
3. Clearly mark the correct answer
4. Add a brief explanation for each answer
5. Questions must match ${examType} difficulty level
${isHindi ? '6. सभी questions, options और explanations हिंदी में होने चाहिए' : ''}

Return ONLY a valid JSON array in this exact format (no extra text):
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation here"
  }
]

correctAnswer is the index (0=A, 1=B, 2=C, 3=D).`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
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

    // JSON extract करो
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid response format from AI' });
    }

    const questions = JSON.parse(jsonMatch[0]);
    res.json({ questions, language: language || 'English' });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions', details: error.message });
  }
});

module.exports = router;
