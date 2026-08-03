import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { sendChatMessage } from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { currentLang, isTa } = useLanguage();
  const { sensorState, chatHistory, setChatHistory } = useHardware();
  const botBodyRef = useRef(null);

  const getInitialWelcomeMessage = () => {
    return isTa
      ? `👋 NutriSoil-க்கு உங்களை வரவேற்கிறோம்!\n\nநான் உங்களுக்கு உதவக்கூடியவை:\n🌾 பயிர் பரிந்துரை\n🧪 உர பரிந்துரை\n🌱 மண் ஆரோக்கியம்\n🍃 நோய் கண்டறிதல்`
      : `👋 Welcome to NutriSoil!\n\nI can help you with:\n🌾 Crop Recommendation\n🧪 Fertilizer\n🌱 Soil Health\n🍃 Disease Detection`;
  };

  // Initialize chat history in Context API if empty
  useEffect(() => {
    if (!chatHistory || chatHistory.length === 0) {
      setChatHistory([{ sender: 'bot', text: getInitialWelcomeMessage() }]);
    }
  }, []);

  // Update initial message when language changes (if only initial message present)
  useEffect(() => {
    if (chatHistory && chatHistory.length === 1 && chatHistory[0].sender === 'bot') {
      setChatHistory([{ sender: 'bot', text: getInitialWelcomeMessage() }]);
    }
  }, [currentLang]);

  // Auto scroll to bottom of chat window
  useEffect(() => {
    if (botBodyRef.current) {
      botBodyRef.current.scrollTop = botBodyRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen, isTyping]);

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || isTyping) return;

    // 1. Add User Message to Context API State
    const userMsg = { sender: 'user', text };
    setChatHistory((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // 2. Call Gemini AI / Backend POST /chatbot API
    try {
      const backendRes = await sendChatMessage(text, currentLang, sensorState);
      if (backendRes && backendRes.reply) {
        setIsTyping(false);
        setChatHistory((prev) => [...prev, { sender: 'bot', text: backendRes.reply }]);
        return;
      }
    } catch (err) {
      console.warn('Gemini API offline, falling back to local NutriBot logic:', err);
    }

    // 3. Simulated short typing delay for realistic UX
    setTimeout(() => {
      setIsTyping(false);
      const msg = text.toLowerCase();
      let reply = '';

      if (
        msg.includes('hi') ||
        msg.includes('hello') ||
        msg.includes('hey') ||
        msg.includes('வணக்கம்') ||
        msg.includes('ஹலோ')
      ) {
        reply = isTa
          ? `👋 வணக்கம்! நான் NutriBot.\n\n🌱 மண் ஆரோக்கியம்\n🌾 பயிர் பரிந்துரை\n🧪 உர பரிந்துரை\n💧 நீர்ப்பாசனம்\n🍃 நோய் கண்டறிதல்\n🏛️ அரசு திட்டங்கள்\n\nஇவற்றைப் பற்றி என்னிடம் கேளுங்கள்.`
          : `👋 Hello! I am NutriBot.\n\nI can help you with:\n\n🌱 Soil Health\n🌾 Crop Recommendation\n🧪 Fertilizer\n💧 Irrigation\n🍃 Disease Detection\n\nAsk me anything!`;
      } else if (
        msg.includes('soil') ||
        msg.includes('மண்') ||
        msg.includes('soil health') ||
        msg.includes('score')
      ) {
        reply = isTa
          ? `🌱 உங்கள் Soil Health Score : ${sensorState.score}\n\n✅ மண் நல்ல நிலையில் உள்ளது.\n\n🌾 பொருத்தமான பயிர்கள்:\n• நெல்\n• வாழை\n• கரும்பு`
          : `🌱 Soil Health Score : ${sensorState.score}\n\n✅ Soil condition is healthy.\n\nRecommended Crops:\n• Paddy\n• Banana\n• Sugarcane`;
      } else if (
        msg.includes('crop') ||
        msg.includes('பயிர்') ||
        msg.includes('rice') ||
        msg.includes('paddy') ||
        msg.includes('banana') ||
        msg.includes('coconut') ||
        msg.includes('நெல்')
      ) {
        reply = isTa
          ? `🌾 பரிந்துரைக்கப்படும் பயிர்கள்:\n\n✅ நெல்\n✅ வாழை\n✅ கரும்பு\n\nஉங்கள் மண்ணிற்கு இவை மிகவும் பொருத்தமானவை.`
          : `🌾 Recommended Crops\n\n✅ Paddy\n✅ Banana\n✅ Sugarcane\n\nThese crops are suitable for your soil.`;
      } else if (
        msg.includes('fertilizer') ||
        msg.includes('fertiliser') ||
        msg.includes('urea') ||
        msg.includes('dap') ||
        msg.includes('உரம்')
      ) {
        reply = isTa
          ? `🧪 உர பரிந்துரை\n\n• யூரியா\n• DAP\n• இயற்கை உரம்\n\nசமநிலை உரத்தை பயன்படுத்துங்கள்.`
          : `🧪 Fertilizer Recommendation\n\n• Urea\n• DAP\n• Organic Compost\n\nUse balanced fertilizer.`;
      } else if (
        msg.includes('water') ||
        msg.includes('irrigation') ||
        msg.includes('நீர்') ||
        msg.includes('நீர்ப்பாசனம்')
      ) {
        reply = isTa
          ? `💧 மண் ஈரப்பதம் : ${sensorState.moisture}%\n\nDrip Irrigation பரிந்துரைக்கப்படுகிறது.`
          : `💧 Soil Moisture : ${sensorState.moisture}%\n\nDrip irrigation is recommended.`;
      } else if (
        msg.includes('disease') ||
        msg.includes('leaf') ||
        msg.includes('plant') ||
        msg.includes('நோய்') ||
        msg.includes('இலை')
      ) {
        reply = isTa
          ? `🍃 இலை புகைப்படத்தை Upload செய்யுங்கள்.\n\nநான்\n✅ நோய்\n✅ காரணம்\n✅ மருந்து\n✅ தடுப்பு\n\nஎல்லாவற்றையும் கூறுவேன்.`
          : `🍃 Upload a leaf image.\n\nI will identify\n✅ Disease\n✅ Cause\n✅ Treatment\n✅ Prevention`;
      } else if (
        msg.includes('weather') ||
        msg.includes('temperature') ||
        msg.includes('climate') ||
        msg.includes('வானிலை')
      ) {
        reply = isTa
          ? `☀️ வெப்பநிலை : ${sensorState.temperature}°C\n\nமழை வாய்ப்பு இருந்தால் உரம் இடுவதை தவிர்க்கவும்.`
          : `☀️ Temperature : ${sensorState.temperature}°C\n\nAvoid fertilizer application before heavy rainfall.`;
      } else if (
        msg.includes('thanks') ||
        msg.includes('thank') ||
        msg.includes('நன்றி')
      ) {
        reply = isTa
          ? `😊 நன்றி!\n\nஉங்கள் விவசாயத்திற்கு வாழ்த்துகள் 🌾`
          : `😊 You're Welcome!\n\nHappy Farming 🌾`;
      } else {
        reply = isTa
          ? `🤖 மன்னிக்கவும். அந்த கேள்வியை புரிந்து கொள்ள முடியவில்லை.\n\nநீங்கள் கேட்கலாம்:\n🌱 மண்\n🌾 பயிர்\n🧪 உரம்\n💧 நீர்ப்பாசனம்\n🍃 நோய்\n🏛️ அரசு திட்டங்கள்`
          : `🤖 Sorry! I couldn't understand.\n\nTry asking about:\n🌱 Soil\n🌾 Crop\n🧪 Fertilizer\n💧 Irrigation\n🍃 Disease`;
      }

      setChatHistory((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button id="botButton" onClick={() => setIsOpen(!isOpen)} title="NutriBot AI">
        🤖
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div id="nutriBot">
          {/* Header */}
          <div id="botHeader">
            <span>🌱 NutriBot</span>
            <span onClick={() => setIsOpen(false)}>✖</span>
          </div>

          {/* Messages Body */}
          <div id="botBody" ref={botBodyRef}>
            {(chatHistory || []).map((msg, index) => (
              <div
                key={index}
                className={msg.sender === 'user' ? 'userMessage' : 'botMessage'}
              >
                {msg.text}
              </div>
            ))}

            {/* Typing Indicator Animation */}
            {isTyping && (
              <div className="botMessage" style={{ fontStyle: 'italic', color: '#6B7280' }}>
                NutriBot is typing...
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <div id="botFooter">
            <input
              type="text"
              id="botInput"
              placeholder={isTa ? 'எதுவும் கேளுங்கள்...' : 'Ask anything...'}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend} disabled={isTyping}>
              {isTa ? 'அனுப்பு' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
