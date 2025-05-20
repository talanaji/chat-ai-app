const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const CHAT_LOG_DIR = path.join(__dirname, 'chat_logs');
const SESSION_LIST_FILE = path.join(CHAT_LOG_DIR, 'sessions.json');

if (!fs.existsSync(CHAT_LOG_DIR)) fs.mkdirSync(CHAT_LOG_DIR);

// Create a new session
app.get('/session', (req, res) => {
  const sessionId = uuidv4();
  const title = `Session ${new Date().toLocaleString()}`;
  const newSession = {
    id: sessionId,
    title,
    createdAt: new Date().toISOString()
  };

  let sessions = [];
  if (fs.existsSync(SESSION_LIST_FILE)) {
    sessions = JSON.parse(fs.readFileSync(SESSION_LIST_FILE));
  }

  sessions.push(newSession);
  fs.writeFileSync(SESSION_LIST_FILE, JSON.stringify(sessions, null, 2));

  res.json({ sessionId, title });
});

// Get all session metadata
app.get('/sessions', (req, res) => {
  if (!fs.existsSync(SESSION_LIST_FILE)) {
    return res.json([]);
  }

  const sessions = JSON.parse(fs.readFileSync(SESSION_LIST_FILE));
  res.json(sessions);
});

// Get specific chat log by sessionId
app.get('/chat/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const filePath = path.join(CHAT_LOG_DIR, `${sessionId}.json`);

  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath));
    res.json(data);
  } else {
    res.status(200).json([]);
  }
});

// Post a new message
app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    }));

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    });

    const reply = response.data.choices[0].message.content;

    const filePath = path.join(CHAT_LOG_DIR, `${sessionId}.json`);
    let history = [];

    if (fs.existsSync(filePath)) {
      history = JSON.parse(fs.readFileSync(filePath));
    }

    history.push({
      timestamp: new Date().toISOString(),
      message,
      reply
    });

    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
    res.json({ reply });
  } catch (err) {
    console.error('❌ OpenAI Error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(5050, () => {
  console.log('✅ Server running at http://localhost:5050');
});
