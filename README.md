# 💬 AI Chat Assistant

An interactive AI chat application using OpenAI's GPT model, built with **React** (frontend) and **Node.js + Express** (backend).  
It supports multiple saved sessions, chat history stored in JSON files, and session titles for easy access.

---

## 🚀 Features

- Chat with an AI using `gpt-3.5-turbo`
- Automatic session creation with timestamps
- Persistent chat history saved as JSON
- View and load previous sessions
- Smart session reuse (reload = same session)
- Simple UI with message bubbles

---

## 📂 Project Structure

```
chat-ai-app/
│
├── server/                 # Backend (Node.js + Express)
│   ├── index.js            # API logic and OpenAI integration
│   ├── .env                # OpenAI API key
│   └── chat_logs/          # Session files + messages
│       └── sessions.json   # Master session list
│
├── chat-ai-app/            # Frontend (React)
│   ├── src/
│   │   └── App.js          # Chat UI and session handling
│   └── public/
│
├── README.md
```

---

## 🔧 Installation

### 1. Clone the repo

```bash
git clone git@github.com:your-username/ai-chat-app.git
cd ai-chat-app
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_key_here
```

Then run the backend:

```bash
npx nodemon index.js
```

### 3. Set up the frontend

```bash
cd ../chat-ai-app
npm install
npm start
```

---

## 🌐 Usage

- Visit `http://localhost:3000`
- The app will load the latest session (or create a new one)
- Type messages to chat with the AI
- Use the dropdown menu to load previous sessions

---

## 🛡 Tech Stack

- React
- Node.js / Express
- OpenAI GPT API
- Local JSON storage (no database needed)
- Pure CSS styling

---

## 📌 Future Improvements

- Rename sessions
- Delete sessions
- Export chat to file
- Authentication & private sessions
- Online deployment with Vercel + Render

---

## 💡 License

MIT © 2025 – Built by Tala Alnaji
