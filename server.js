require('dotenv').config();
const express = require('express');
const path = require('path');
const chatRoute = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple shared-secret gate so a random person who finds your URL can't
// burn through your free Groq quota. Leave ACCESS_KEY unset to disable.
app.use('/api/chat', (req, res, next) => {
  if (!process.env.ACCESS_KEY) return next(); // no gate configured
  const provided = req.headers['x-access-key'];
  if (provided !== process.env.ACCESS_KEY) {
    return res.status(401).json({ error: 'Invalid or missing access key.' });
  }
  next();
});

app.use('/api/chat', chatRoute);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    accessGateEnabled: Boolean(process.env.ACCESS_KEY),
  });
});

app.listen(PORT, () => {
  console.log(`MyChat running at http://localhost:${PORT}`);
  console.log(process.env.GROQ_API_KEY ? 'Groq: configured' : 'Groq: NOT configured — set GROQ_API_KEY in .env');
  console.log(process.env.ACCESS_KEY ? 'Access gate: enabled' : 'Access gate: disabled (anyone with the URL can chat)');
});
