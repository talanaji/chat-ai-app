const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// Endpoint to create a new session
app.get('/session', (req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});

// Endpoint to handle chat messages
app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Missing message or sessionId' });
    }
    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    }));

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    });
    
    const reply = response.data.choices[0].message.content;

    // Log the conversation
    const logDir = path.join(__dirname, 'chat_logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const sessionFile = path.join(logDir, `${sessionId}.json`);

    let log = [];
    if (fs.existsSync(sessionFile)) {
      const raw = fs.readFileSync(sessionFile);
      log = JSON.parse(raw);
    }

    log.push({ timestamp: new Date().toISOString(), message, reply });
    fs.writeFileSync(sessionFile, JSON.stringify(log, null, 2));

    res.json({ reply });
  } catch (err) {
    console.error('❌ OpenAI or File Error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});


app.listen(5050, () => {
  console.log('✅ Server running at http://localhost:5050');
});
