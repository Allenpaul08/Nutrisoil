import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { sendChatMessage } from '../services/api';

export const useAIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const { currentLang, isTa } = useLanguage();
  const { sensorState } = useHardware();
  const botBodyRef = useRef(null);

  const getInitialWelcomeMessage = () => {
    return isTa
      ? `👋 NutriSoil-க்கு உங்களை வரவேற்கிறோம்!\n\nநான் உங்களுக்கு உதவக்கூடியவை:\n🌾 பயிர் பரிந்துரை\n🧪 உர பரிந்துரை\n🌱 மண் ஆரோக்கியம்\n🍃 நோய் கண்டறிதல்`
      : `👋 Welcome to NutriSoil!\n\nI can help you with:\n🌾 Crop Recommendation\n🧪 Fertilizer\n🌱 Soil Health\n🍃 Disease Detection`;
  };

  const [messages, setMessages] = useState([
    { sender: 'bot', text: getInitialWelcomeMessage() }
  ]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'bot') {
        return [{ sender: 'bot', text: getInitialWelcomeMessage() }];
      }
      return prev;
    });
  }, [currentLang]);

  useEffect(() => {
    if (botBodyRef.current) {
      botBodyRef.current.scrollTop = botBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Backend Gemini API fallback
    const backendRes = await sendChatMessage(text, currentLang, sensorState);
    if (backendRes && backendRes.reply) {
      setMessages((prev) => [...prev, { sender: 'bot', text: backendRes.reply }]);
      return;
    }

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

    setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
  };

  return {
    isOpen,
    setIsOpen,
    inputVal,
    setInputVal,
    messages,
    handleSend,
    botBodyRef
  };
};
