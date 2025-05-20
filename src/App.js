import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get new sessionId on first load
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch('http://localhost:5050/sessions');
        const sessions = await res.json();
  
        if (sessions.length > 0) {
          const sorted = sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setSessionId(sorted[0].id);
        } else {
          const newRes = await fetch('http://localhost:5050/session');
          const data = await newRes.json();
          setSessionId(data.sessionId);
        }
      } catch (err) {
        console.error('❌ Failed to initialize session:', err);
      }
    };
  
    initSession();
  }, []);
  

  // Load previous chat if sessionId changes
  useEffect(() => {
    if (!sessionId) return;

    const fetchChat = async () => {
      const res = await fetch(`http://localhost:5050/chat/${sessionId}`);
      const data = await res.json();

      const formatted = data.flatMap(entry => [
        { sender: 'user', text: entry.message },
        { sender: 'bot', text: entry.reply }
      ]);

      setChatLog(formatted);
    };

    fetchChat();
  }, [sessionId]);

  // Load list of sessions
  useEffect(() => {
    const fetchSessions = async () => {
      const res = await fetch('http://localhost:5050/sessions');
      const data = await res.json();
      setAllSessions(data);
    };
    fetchSessions();
  }, []);

  useEffect(scrollToBottom, [chatLog]);

  const handleSend = async () => {
    if (!message.trim() || !sessionId || loading) return;

    const userMessage = { sender: 'user', text: message };
    setChatLog(prev => [...prev, userMessage]);
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
      setChatLog(prev => [...prev, { sender: 'bot', text: '❌ Failed to fetch response.' }]);
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 600,
      margin: '2rem auto',
      padding: '1rem',
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #ccc',
      borderRadius: '8px',
      backgroundColor: '#fafafa'
    }}>
      <h2 style={{ textAlign: 'center' }}>💬 AI Chat Assistant</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label><strong>🗂 Load Previous Session:</strong></label>{' '}
        <select
          value={sessionId || ''}
          onChange={e => setSessionId(e.target.value)}
          style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
        >
          <option value="" disabled>-- Select a session --</option>
          {allSessions.map(s => (
            <option key={s.id} value={s.id}>{s.title || s.id}</option>
          ))}
        </select>
      </div>

      <div style={{
        minHeight: 300,
        maxHeight: 400,
        overflowY: 'auto',
        border: '1px solid #ddd',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff'
      }}>
        {chatLog.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.sender === 'user' ? 'right' : 'left',
            margin: '0.5rem 0'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 0.75rem',
              backgroundColor: msg.sender === 'user' ? '#d1e7dd' : '#f8d7da',
              borderRadius: '12px',
              maxWidth: '80%',
              wordWrap: 'break-word'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p><i>Bot is typing...</i></p>}
        <div ref={messagesEndRef}></div>
      </div>

      <div style={{ display: 'flex' }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          style={{
            flexGrow: 1,
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: 8,
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
