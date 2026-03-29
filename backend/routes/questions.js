const express = require('express');
const router = express.Router();

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function buildPrompt(exam, chapter, count, lang, difficulty) {
  const difficultyRules = difficulty
    ? `\nDifficulty distribution to follow (approximate): ${difficulty}.`
    : '';

  return `Generate EXACTLY ${count} multiple choice questions for ${exam} exam on topic "${chapter}".
Language: English only. All questions, answer options, and explanations must be written in English (no Hindi/Devanagari).
Rules:
1. Each question must have exactly 4 options
2. One correct answer per question
3. Include brief explanation in English
4. Exam-standard level questions
5. Count EXACTLY ${count} questions before responding

${difficultyRules}

Return ONLY a JSON array. No markdown. No extra text:
[{"q":"question","opts":["A","B","C","D"],"ans":0,"exp":"explanation"}]
ans is 0-indexed. EXACTLY ${count} objects.`;
}

router.post('/generate', async (req, res) => {
  try {
    const { exam, chapter, count, lang, difficulty } = req.body;
    const totalCount = parseInt(count) || 10;
    const chunkSize = 25;
    const chunks = Math.ceil(totalCount / chunkSize);
    let allQuestions = [];
    let lastError = '';

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is missing in backend .env' });
    }

    for (let c = 0; c < chunks; c++) {
      const need = Math.min(chunkSize, totalCount - allQuestions.length);
      let retries = 3;
      while (retries-- > 0 && allQuestions.length < totalCount) {
        const response = await fetch(GROQ_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: buildPrompt(exam, chapter, need, lang, difficulty) }],
            temperature: 0.7,
            max_tokens: 4000
          })
        });

        const data = await response.json();
        if (!response.ok) {
          lastError = data?.error?.message || data?.error || `Groq API error (${response.status})`;
          continue;
        }

        const text = data.choices?.[0]?.message?.content || '';
        if (!text) {
          lastError = 'Groq returned empty content';
          continue;
        }

        const clean = text.replace(/```json|```/g, '').trim();
        const start = clean.indexOf('[');
        const end = clean.lastIndexOf(']');
        if (start === -1 || end === -1) {
          lastError = 'Groq response was not valid JSON array text';
          continue;
        }

        let arr;
        try { arr = JSON.parse(clean.slice(start, end + 1)); }
        catch (e) {
          lastError = `Failed to parse Groq JSON: ${e.message}`;
          continue;
        }

        const valid = arr.filter(q =>
          q.q && Array.isArray(q.opts) &&
          q.opts.length === 4 &&
          typeof q.ans === 'number'
        );
        if (!valid.length) {
          lastError = 'Groq returned items but none matched expected question format';
          continue;
        }
        allQuestions = allQuestions.concat(valid.slice(0, need));
        break;
      }
    }

    if (!allQuestions.length) {
      return res.status(502).json({
        error: lastError || 'Could not generate questions from Groq API'
      });
    }

    res.json({
      success: true,
      questions: allQuestions.slice(0, totalCount),
      count: allQuestions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;