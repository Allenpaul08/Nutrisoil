import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { sendGroqMessage } from '../services/groqChat';

const GROQ_KEY_STORAGE = 'nutrisoil_groq_api_key';

/* ── Suggested quick-question chips ── */
const QUICK_PROMPTS_EN = [
  '🌱 What is my soil score?',
  '🌾 Best crops for my soil?',
  '🧪 Fertilizer recommendation?',
  '💧 Irrigation advice',
  '🔬 What is soil pH?',
];

const QUICK_PROMPTS_TA = [
  '🌱 என் மண் மதிப்பெண் என்ன?',
  '🌾 சிறந்த பயிர் பரிந்துரை?',
  '🧪 உர பரிந்துரை',
  '💧 நீர்ப்பாசன ஆலோசனை',
  '🔬 மண் pH என்றால் என்ன?',
];

/* ── Error message resolver ── */
function getErrorMessage(err, isTa) {
  if (err.message === 'NO_API_KEY') {
    return isTa
      ? `⚙️ Groq API விசை அமைக்கப்படவில்லை.\n\nதயவுசெய்து Settings → AI Configuration இல் உங்கள் Groq API விசையை உள்ளிடவும்.\n\n🔑 console.groq.com இல் இலவசமாக பெறலாம்.`
      : `⚙️ No Groq API key found.\n\nPlease go to Settings → AI Configuration and enter your Groq API key.\n\n🔑 Get a free key at console.groq.com`;
  }
  if (err.message === 'INVALID_API_KEY') {
    return isTa
      ? `❌ தவறான API விசை.\n\nSettings இல் சரியான Groq API விசையை உள்ளிடவும்.`
      : `❌ Invalid API key.\n\nPlease check your Groq API key in Settings.`;
  }
  if (err.message === 'RATE_LIMITED') {
    return isTa
      ? `⏳ அதிக கோரிக்கைகள். கொஞ்சம் நிறுத்தி மீண்டும் முயற்சிக்கவும்.`
      : `⏳ Rate limited. Please wait a moment and try again.`;
  }
  if (err.message === 'CONTEXT_TOO_LONG') {
    return isTa
      ? `⚠️ உரையாடல் மிகவும் நீளமாக உள்ளது. Clear பொத்தானை அழுத்தி மீண்டும் தொடங்கவும்.`
      : `⚠️ Conversation is too long. Please tap Clear to start a fresh chat.`;
  }
  // Log unknown errors for debugging
  console.error('[NutriBot] Unhandled error:', err.message);
  return isTa
    ? `⚠️ பிழை ஏற்பட்டது: ${err.message}\n\nமீண்டும் முயற்சிக்கவும்.`
    : `⚠️ Error: ${err.message}\n\nPlease try again.`;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const { currentLang, isTa } = useLanguage();
  const { sensorState, chatHistory, setChatHistory } = useHardware();
  const botBodyRef = useRef(null);

  const quickPrompts = isTa ? QUICK_PROMPTS_TA : QUICK_PROMPTS_EN;

  const getInitialWelcomeMessage = () =>
    isTa
      ? `👋 NutriSoil-க்கு உங்களை வரவேற்கிறோம்!\n\nநான் NutriBot — Groq AI ஆல் இயக்கப்படும் விவசாய உதவியாளர்.\n\n🌾 பயிர் பரிந்துரை\n🧪 உர ஆலோசனை\n🌱 மண் ஆரோக்கியம்\n💧 நீர்ப்பாசனம்\n\nகீழே உள்ள கேள்விகளில் ஒன்றை தேர்வு செய்யுங்கள் அல்லது நேரடியாக கேளுங்கள்!`
      : `👋 Welcome to NutriSoil!\n\nI'm NutriBot — your AI farming assistant powered by Groq.\n\nI can help you with:\n🌾 Crop Recommendations\n🧪 Fertilizer Advice\n🌱 Soil Health Analysis\n💧 Irrigation Planning\n\nTap a quick question below or ask me anything!`;

  /* Init chat */
  useEffect(() => {
    if (!chatHistory || chatHistory.length === 0) {
      setChatHistory([{ sender: 'bot', text: getInitialWelcomeMessage() }]);
    }
  }, []);

  /* Update welcome message on language change */
  useEffect(() => {
    if (chatHistory && chatHistory.length === 1 && chatHistory[0].sender === 'bot') {
      setChatHistory([{ sender: 'bot', text: getInitialWelcomeMessage() }]);
    }
  }, [currentLang]);

  /* Auto-scroll */
  useEffect(() => {
    if (botBodyRef.current) {
      botBodyRef.current.scrollTop = botBodyRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen, isTyping]);

  /* Hide quick prompts after user sends first message */
  useEffect(() => {
    const userMsgCount = (chatHistory || []).filter((m) => m.sender === 'user').length;
    if (userMsgCount > 0) setShowQuickPrompts(false);
  }, [chatHistory]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const apiKey = localStorage.getItem(GROQ_KEY_STORAGE) || '';

    const userMsg = { sender: 'user', text: trimmed };
    setChatHistory((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);
    setShowQuickPrompts(false);

    try {
      const currentHistory = [...(chatHistory || [])];
      const reply = await sendGroqMessage(trimmed, sensorState, currentHistory, apiKey);
      setChatHistory((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      const errorText = getErrorMessage(err, isTa);
      setChatHistory((prev) => [...prev, { sender: 'bot', text: errorText, isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => sendMessage(inputVal);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt) => sendMessage(prompt);

  const handleClearChat = () => {
    setChatHistory([{ sender: 'bot', text: getInitialWelcomeMessage() }]);
    setShowQuickPrompts(true);
  };

  const hasApiKey = !!(localStorage.getItem(GROQ_KEY_STORAGE) || '').trim();

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="botButton"
        onClick={() => setIsOpen(!isOpen)}
        title="NutriBot AI"
        style={{ animation: isOpen ? 'none' : 'botPulse 2.5s infinite ease-in-out' }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div id="nutriBot">
          {/* Header */}
          <div id="botHeader">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              }}>🌱</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', lineHeight: '1.2' }}>NutriBot</div>
                <div style={{ fontSize: '10px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: hasApiKey ? '#86EFAC' : '#FCD34D',
                    display: 'inline-block',
                  }} />
                  {hasApiKey ? 'Groq AI Ready' : 'API key needed'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={handleClearChat}
                title="Clear chat"
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                  borderRadius: '8px', padding: '5px 8px', fontSize: '11px',
                  cursor: 'pointer', fontWeight: '600',
                }}
              >
                Clear
              </button>
              <span
                onClick={() => setIsOpen(false)}
                style={{ cursor: 'pointer', fontSize: '20px', opacity: 0.85, paddingLeft: '4px' }}
              >✕</span>
            </div>
          </div>

          {/* Messages Body */}
          <div id="botBody" ref={botBodyRef}>
            {(chatHistory || []).map((msg, index) => (
              <div
                key={index}
                className={msg.sender === 'user' ? 'userMessage' : 'botMessage'}
                style={msg.isError ? {
                  background: '#FEF2F2', borderColor: '#FCA5A5', color: '#7F1D1D'
                } : {}}
              >
                {msg.text}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="botMessage" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  NutriBot is thinking
                </span>
                <span className="typing-dots">
                  <span /><span /><span />
                </span>
              </div>
            )}

            {/* Quick prompt chips */}
            {showQuickPrompts && !isTyping && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>
                  {isTa ? 'விரைவு கேள்விகள்:' : 'Quick questions:'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(prompt)}
                      style={{
                        background: 'white', border: '1.5px solid #C8E6C9',
                        borderRadius: '12px', padding: '8px 12px',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        color: 'var(--primary-green)', textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F0FDF4';
                        e.currentTarget.style.borderColor = '#4CAF50';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#C8E6C9';
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <div id="botFooter">
            <input
              type="text"
              id="botInput"
              placeholder={isTa ? 'எதுவும் கேளுங்கள்...' : 'Ask anything about your farm...'}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !inputVal.trim()}
              style={{
                opacity: (isTyping || !inputVal.trim()) ? 0.6 : 1,
                cursor: (isTyping || !inputVal.trim()) ? 'not-allowed' : 'pointer',
              }}
            >
              {isTyping ? '...' : (isTa ? 'அனுப்பு' : 'Send')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
