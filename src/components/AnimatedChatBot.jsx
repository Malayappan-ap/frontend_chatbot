import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './chatbot.css';

const AnimatedChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userData, setUserData] = useState({
    user_name: '',
    user_email: '',
    bot_type: 'Dynamic Chat',
    user_message: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [botPersona, setBotPersona] = useState('FriendlyBot');
  const [points, setPoints] = useState(0);
  const [file, setFile] = useState(null);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const sendEmailWithData = async (data) => {
    if (!data.user_message && !file) {
      addBotMessage('❗ Please provide a message or attach a file before submitting.');
      return;
    }

    if (!isValidEmail(data.user_email)) {
      addBotMessage('❗ Please enter a valid email address.');
      return;
    }

    const formData = new FormData();
    formData.append('user_name', data.user_name);
    formData.append('user_email', data.user_email);
    formData.append('bot_type', data.bot_type);
    formData.append('user_message', data.user_message || '[No message provided]');
    if (file) {
  formData.append('file', file); // ✅ append the real file object directly
}


    try {
      const response = await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        addBotMessage('✅ Details sent successfully!');
      } else {
        addBotMessage('❌ Failed to send email. Try again later.');
      }
    } catch (err) {
      console.error('Error:', err);
      addBotMessage('🚨 Server error occurred.');
    }
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { text, sender: 'user' }]);
  };

  const addBotMessage = (text) => {
    setIsTyping(true);
    setMessages((prev) => [...prev, { text, sender: 'bot' }]);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    const currentInput = input.trim();
    addUserMessage(currentInput);
    setInput('');

    setTimeout(() => {
      if (!userData.user_name) {
        const updated = { ...userData, user_name: currentInput };
        setUserData(updated);
        addBotMessage("Nice to meet you! What's your email?");
      } else if (!userData.user_email) {
        const updated = { ...userData, user_email: currentInput };
        setUserData(updated);
        addBotMessage("Cool! What's your message?");
      } else if (!userData.user_message) {
        const updated = { ...userData, user_message: currentInput };
        setUserData(updated);
        addBotMessage('Sending your details...');
        sendEmailWithData(updated);
      }
    }, 1000);
  };

  useEffect(() => {
    if (isTyping) {
      setTimeout(() => setIsTyping(false), 1500);
    }
  }, [isTyping]);

  const changeBotPersona = (persona) => {
    setBotPersona(persona);
    addBotMessage(`You are now talking to ${persona}. Let's get started!`);
  };

  const fetchJoke = async () => {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const joke = await response.json();
    addBotMessage(`😂 ${joke.setup} — ${joke.punchline}`);
  };

  const startSpeechRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.start();
    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setInput(speech);
      addUserMessage(speech);
      setIsTyping(true);
      setTimeout(() => addBotMessage('...'), 1500);
    };
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        setFile(uploadedFile); // 👈 store real File object
    addUserMessage(`You've attached a file: ${uploadedFile.name}`);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  return (
    <div className="chat-container">
      <h2>✨ Dynamic ChatBot</h2>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`chat-message ${msg.sender}`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      <div className="input-section">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Type your message..."
        />
        <button onClick={handleSubmit}>Send</button>
        <button onClick={startSpeechRecognition}>🎤 Speak</button>
        <button onClick={fetchJoke}>Tell me a Joke!</button>
        <input type="file" onChange={handleFileUpload} />
      </div>

      <div className="bot-persona">
        <button onClick={() => changeBotPersona('FriendlyBot')}>FriendlyBot</button>
        <button onClick={() => changeBotPersona('TechBot')}>TechBot</button>
        <button onClick={() => changeBotPersona('AIConfessionBot')}>AI Confession Bot</button>
      </div>

      <div className="points-section">
        <p>⭐ Points: {points}</p>
        <button onClick={() => setPoints(points + 10)}>Earn 10 Points</button>
      </div>
    </div>
  );
};

export default AnimatedChatBot;
