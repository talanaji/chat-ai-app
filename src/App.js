import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSessionId = async () => {
      const res = await fetch('http://localhost:5050/session');
      const data = await res.json();
      setSessionId(data.sessionId);
    };
    getSessionId();
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !sessionId) return;

    const userMessage = { sender: 'user', text: message };
    setChatLog([...chatLog, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5050/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId })
      });
      const data = await res.json();
      const botMessage = { sender: 'bot', text: data.reply };
      setChatLog(prev => [...prev, botMessage]);
    } catch (err) {
      setChatLog(prev => [...prev, { sender: 'bot', text: '❌ Failed to fetch response' }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem', fontFamily: 'Arial' }}>
      <h2>🧠 AI Chat Assistant</h2>

      <div style={{ minHeight: 300, border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
        {chatLog.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        ))}
        {loading && <p>Bot: typing...</p>}
      </div>

      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your message..."
        style={{ width: '80%', padding: '0.5rem' }}
      />
      <button onClick={handleSend} style={{ padding: '0.5rem', marginLeft: 5 }}>Send</button>
    </div>
  );
}

export default App;
