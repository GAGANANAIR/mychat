const express = require('express');
const router = express.Router();

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

router.post('/', async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server is missing GROQ_API_KEY. Add it to .env and restart.' });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request must include a non-empty "messages" array.' });
  }

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      console.error('Groq API error:', data);
      return res.status(groqRes.status).json({ error: data.error?.message || 'Groq API request failed.' });
    }

    const reply = data.choices?.[0]?.message?.content || '';
    res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err.message);
    res.status(500).json({ error: 'Failed to reach Groq API.' });
  }
});

module.exports = router;
