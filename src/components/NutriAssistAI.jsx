/**
 * NutriAssistAI.jsx — Fully Working AI Voice + Chat Assistant
 *
 * Stack (100% frontend, no backend needed):
 *   Voice Input  → Web Speech API (SpeechRecognition) — Chrome/Edge built-in
 *   AI Response  → Groq API via existing sendGroqMessage() service
 *   Voice Output → Web Speech API (SpeechSynthesis) — all browsers
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendGroqMessage }  from '../services/groqChat';
import { useHardware }      from '../context/HardwareContext';

/* ─── Constants ─── */
const GROQ_KEY_STORAGE = 'nutrisoil_groq_api_key';
const VOICE_IDLE       = 'idle';
const VOICE_LISTENING  = 'listening';
const VOICE_PROCESSING = 'processing';
const VOICE_SPEAKING   = 'speaking';

/* ─── Suggested chips ─── */
const CHIPS = {
  en: [
    { icon: '🌿', label: 'How is my soil health?'       },
    { icon: '🌾', label: 'Which crop should I grow?'     },
    { icon: '🧪', label: 'Recommend fertilizer'          },
    { icon: '🔬', label: 'Detect plant disease'          },
    { icon: '📊', label: 'Explain soil score'            },
    { icon: '🏛️', label: 'Government schemes'            },
    { icon: '💧', label: 'Irrigation recommendation'    },
  ],
  ta: [
    { icon: '🌿', label: 'என் மண் ஆரோக்கியம் எப்படி?'  },
    { icon: '🌾', label: 'என்ன பயிர் விளைவிக்கலாம்?'  },
    { icon: '🧪', label: 'உர பரிந்துரை'                 },
    { icon: '🔬', label: 'தாவர நோய் கண்டறிதல்'         },
    { icon: '📊', label: 'மண் மதிப்பெண் விளக்கம்'      },
    { icon: '🏛️', label: 'அரசு திட்டங்கள்'              },
    { icon: '💧', label: 'நீர்ப்பாசன பரிந்துரை'         },
  ],
};

/* ─── Detect Tamil Unicode in a string ─── */
const hasTamil = (str) => /[\u0B80-\u0BFF]/.test(str);

/* ─── Strip markdown symbols for TTS ─── */
const stripMarkdown = (text) =>
  text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s/gm, '')
    .trim();

/* ─── Error → user-friendly message ─── */
function friendlyError(err, isTa) {
  const m = err.message;
  if (m === 'NO_API_KEY')
    return isTa
      ? '⚙️ Groq API விசை இல்லை.\n\nSettings → AI Configuration இல் உங்கள் API விசையை சேமிக்கவும்.\n\n🔑 console.groq.com இல் இலவசமாக பெறலாம்.'
      : '⚙️ No Groq API key found.\n\nGo to Settings → AI Configuration and add your key.\n\n🔑 Get a free key at console.groq.com';
  if (m === 'INVALID_API_KEY')
    return isTa
      ? '❌ தவறான API விசை. Settings இல் சரிபார்க்கவும்.'
      : '❌ Invalid API key. Please check it in Settings.';
  if (m === 'RATE_LIMITED')
    return isTa
      ? '⏳ அதிக கோரிக்கைகள். சிறிது நேரம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.'
      : '⏳ Rate limited. Please wait a moment and try again.';
  if (m === 'CONTEXT_TOO_LONG')
    return isTa
      ? '⚠️ உரையாடல் மிக நீளமாக உள்ளது. Clear செய்து மீண்டும் தொடங்கவும்.'
      : '⚠️ Conversation too long. Clear the chat and start again.';
  return isTa
    ? `⚠️ பிழை: ${m}. மீண்டும் முயற்சிக்கவும்.`
    : `⚠️ Error: ${m}. Please try again.`;
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
export default function NutriAssistAI() {
  const { sensorState }           = useHardware();
  const [isOpen,   setIsOpen]     = useState(false);
  const [lang,     setLang]       = useState('en');   // 'en' | 'ta'
  const [messages, setMessages]   = useState([]);
  const [inputVal, setInputVal]   = useState('');
  const [voiceState, setVoiceState] = useState(VOICE_IDLE);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');  // live STT transcript
  const [fabPulse, setFabPulse]   = useState(true);
  const [apiKey,   setApiKey]     = useState('');
  const [sttSupported, setSttSupported] = useState(true);

  const bodyRef    = useRef(null);
  const inputRef   = useRef(null);
  const recogRef   = useRef(null);   // SpeechRecognition instance
  const synthRef   = useRef(window.speechSynthesis);
  const stopTtsRef = useRef(false);

  const isTa = lang === 'ta';

  /* ─── Load API key from storage ─── */
  useEffect(() => {
    const key = localStorage.getItem(GROQ_KEY_STORAGE) || '';
    setApiKey(key);
    const onStorage = () => setApiKey(localStorage.getItem(GROQ_KEY_STORAGE) || '');
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ─── Check STT support ─── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSttSupported(false);
  }, []);

  /* ─── Stop FAB pulse after 5 s ─── */
  useEffect(() => {
    const t = setTimeout(() => setFabPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  /* ─── Welcome message when first opened ─── */
  useEffect(() => {
    if (isOpen && messages.length === 0) pushWelcome(isTa);
  }, [isOpen]);

  /* ─── Refresh welcome on lang toggle (only if chat is fresh) ─── */
  useEffect(() => {
    if (isOpen && messages.length === 1 && messages[0]?.sender === 'bot')
      pushWelcome(isTa);
  }, [lang]);

  /* ─── Auto-scroll ─── */
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, isThinking, voiceState, transcript]);

  /* ─── Cleanup on unmount ─── */
  useEffect(() => () => {
    stopRecognition();
    stopTts();
  }, []);

  /* ─── Helpers ─── */
  const pushWelcome = (ta) => {
    const text = ta
      ? `வணக்கம்! 🙏\nநான் NutriAssist AI.\nஉங்கள் விவசாயத்திற்கு தேவையான அனைத்து தகவல்களையும் வழங்க உதவுகிறேன்.\n\nகீழே உள்ள கேள்விகளில் ஒன்றை தேர்வு செய்யுங்கள் அல்லது நேரடியாக கேளுங்கள்!`
      : `Welcome to NutriSoil! 🙏\nI am NutriAssist AI — your smart farming assistant.\n\nI can help with soil health, crops, fertilizers, irrigation, government schemes and more.\n\nTap a question below or ask me anything!`;
    setMessages([{ id: Date.now(), sender: 'bot', text }]);
  };

  const addMsg = (sender, text, extra = {}) =>
    setMessages(prev => [...prev, { id: Date.now(), sender, text, ...extra }]);

  /* ══════════════════════════════════════════
     SPEECH SYNTHESIS (TTS)
  ══════════════════════════════════════════ */
  const stopTts = useCallback(() => {
    stopTtsRef.current = true;
    synthRef.current?.cancel();
  }, []);

  const speak = useCallback((text, ta = false, onEnd = null) => {
    if (!synthRef.current) { onEnd?.(); return; }
    synthRef.current.cancel();
    stopTtsRef.current = false;

    const clean  = stripMarkdown(text);
    // Break into sentences to avoid Chrome 15-word TTS limit
    const sentences = clean.match(/[^.!?\n]+[.!?\n]?/g) || [clean];
    let idx = 0;

    const sayNext = () => {
      if (stopTtsRef.current || idx >= sentences.length) {
        onEnd?.();
        return;
      }
      const utt  = new SpeechSynthesisUtterance(sentences[idx++].trim());
      utt.lang   = ta ? 'ta-IN' : 'en-IN';
      utt.rate   = ta ? 0.9 : 1.0;
      utt.pitch  = 1.0;
      utt.volume = 1.0;

      // Pick best available voice
      const voices  = synthRef.current.getVoices();
      const langTag  = ta ? 'ta' : 'en';
      const preferred = voices.find(v => v.lang.startsWith(langTag) && v.localService) ||
                        voices.find(v => v.lang.startsWith(langTag)) ||
                        voices.find(v => v.lang.startsWith('en'));
      if (preferred) utt.voice = preferred;

      utt.onend = sayNext;
      utt.onerror = () => { onEnd?.(); };
      synthRef.current.speak(utt);
    };

    // Chrome requires a tiny delay after cancel()
    setTimeout(sayNext, 100);
  }, []);

  /* ══════════════════════════════════════════
     SPEECH RECOGNITION (STT)
  ══════════════════════════════════════════ */
  const stopRecognition = useCallback(() => {
    recogRef.current?.abort();
    recogRef.current = null;
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      addMsg('bot',
        isTa
          ? '⚠️ உங்கள் browser-ல் voice recognition ஆதரிக்கப்படவில்லை. Chrome அல்லது Edge பயன்படுத்தவும்.'
          : '⚠️ Voice recognition is not supported in this browser. Please use Chrome or Edge.',
        { isError: true }
      );
      return;
    }

    stopTts();
    setTranscript('');
    setVoiceState(VOICE_LISTENING);

    const recog = new SR();
    recog.lang        = isTa ? 'ta-IN' : 'en-IN';
    recog.continuous  = false;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recogRef.current  = recog;

    recog.onresult = (e) => {
      const t = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ');
      setTranscript(t);
    };

    recog.onend = () => {
      const finalText = recogRef.current?._finalTranscript ||
        document.getElementById('_naTranscriptStore')?.value || '';
      recogRef.current = null;
      setTranscript('');
      if (finalText.trim()) {
        handleSend(finalText.trim(), true);
      } else {
        setVoiceState(VOICE_IDLE);
      }
    };

    recog.onerror = (e) => {
      recogRef.current = null;
      setTranscript('');
      setVoiceState(VOICE_IDLE);
      if (e.error === 'no-speech') return; // silent — user just didn't speak
      if (e.error === 'not-allowed') {
        addMsg('bot',
          isTa
            ? '🎙️ Microphone அனுமதி மறுக்கப்பட்டது. Browser settings-ல் mic access அனுமதிக்கவும்.'
            : '🎙️ Microphone access denied. Please allow mic access in your browser settings.',
          { isError: true }
        );
      }
    };

    // Store interim for onend
    recog.addEventListener('result', (e) => {
      if (e.results[e.results.length - 1].isFinal) {
        const t = Array.from(e.results).map(r => r[0].transcript).join(' ');
        if (recogRef.current) recogRef.current._finalTranscript = t;
      }
    });

    try { recog.start(); } catch { setVoiceState(VOICE_IDLE); }
  }, [isTa]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
  }, []);

  /* ══════════════════════════════════════════
     CORE: SEND MESSAGE → GROQ AI → TTS
  ══════════════════════════════════════════ */
  const handleSend = useCallback(async (text, fromVoice = false) => {
    const trimmed = text?.trim();
    if (!trimmed || isThinking) return;

    // Auto-detect language from Tamil characters
    const detectedTa = hasTamil(trimmed);
    if (detectedTa && !isTa) setLang('ta');
    else if (!detectedTa && isTa && /[a-zA-Z]/.test(trimmed)) setLang('en');
    const effectiveTa = detectedTa || isTa;

    // Add user message
    addMsg('user', trimmed, { isVoice: fromVoice });
    setInputVal('');
    setVoiceState(VOICE_PROCESSING);
    setIsThinking(true);

    // Read latest API key (may have been added since open)
    const key = localStorage.getItem(GROQ_KEY_STORAGE) || '';

    try {
      // Build history for Groq (current messages minus the one we just added)
      const history = messages.filter(m => m.sender === 'user' || m.sender === 'bot');

      const reply = await sendGroqMessage(trimmed, sensorState, history, key);

      setIsThinking(false);
      addMsg('bot', reply);

      // Auto-speak the reply
      setVoiceState(VOICE_SPEAKING);
      speak(reply, effectiveTa, () => setVoiceState(VOICE_IDLE));

    } catch (err) {
      setIsThinking(false);
      setVoiceState(VOICE_IDLE);
      const msg = friendlyError(err, effectiveTa);
      addMsg('bot', msg, { isError: true });
    }
  }, [isThinking, isTa, messages, sensorState, speak]);

  /* ─── Chip tap ─── */
  const handleChip = (chip) => handleSend(chip.label, false);

  /* ─── Mic button tap ─── */
  const handleMicTap = () => {
    if (voiceState === VOICE_LISTENING) { stopListening(); return; }
    if (voiceState !== VOICE_IDLE)     return;
    stopTts();
    startListening();
  };

  /* ─── Speaker: re-speak last bot message ─── */
  const handleSpeaker = () => {
    if (voiceState !== VOICE_IDLE) { stopTts(); setVoiceState(VOICE_IDLE); return; }
    const lastBot = [...messages].reverse().find(m => m.sender === 'bot');
    if (!lastBot) return;
    setVoiceState(VOICE_SPEAKING);
    speak(lastBot.text, isTa, () => setVoiceState(VOICE_IDLE));
  };

  /* ─── Language toggle ─── */
  const handleLangToggle = () => {
    stopTts();
    stopRecognition();
    setVoiceState(VOICE_IDLE);
    setTranscript('');
    setLang(l => l === 'en' ? 'ta' : 'en');
  };

  /* ─── Clear ─── */
  const handleClear = () => {
    stopTts();
    stopRecognition();
    setVoiceState(VOICE_IDLE);
    setTranscript('');
    setMessages([]);
    pushWelcome(isTa);
  };

  /* ─── Close ─── */
  const handleClose = () => {
    stopTts();
    stopRecognition();
    setVoiceState(VOICE_IDLE);
    setTranscript('');
    setIsOpen(false);
  };

  /* ─── Enter key ─── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputVal);
    }
  };

  /* ─── Computed ─── */
  const hasApiKey = !!apiKey.trim();
  const userHasSpoken = messages.some(m => m.sender === 'user');

  const voiceStateLabel = {
    [VOICE_LISTENING]:  isTa ? '🎙️ கேட்கிறேன்...'        : '🎙️ Listening...',
    [VOICE_PROCESSING]: isTa ? '⚙️ செயலாக்குகிறேன்...'   : '⚙️ Processing...',
    [VOICE_SPEAKING]:   isTa ? '🔊 பேசுகிறேன்...'         : '🔊 Speaking...',
  }[voiceState] || null;

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        id="nutriAssistFab"
        className={fabPulse ? 'fab-pulse' : ''}
        onClick={() => { setIsOpen(true); setFabPulse(false); }}
        title="NutriAssist AI"
        aria-label="Open NutriAssist AI"
      >
        <span className="fab-inner">
          {/* Mic SVG */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8"  y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="fab-sparkle s1">✦</span>
          <span className="fab-sparkle s2">✦</span>
          <span className="fab-sparkle s3">✦</span>
        </span>
      </button>

      {/* ── Full-Screen Overlay ── */}
      {isOpen && (
        <div id="nutriAssistOverlay" role="dialog" aria-modal="true">

          {/* ══ TOP BAR ══ */}
          <div id="naTopBar">
            <button id="naCloseBtn" onClick={handleClose} aria-label="Close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6"  x2="6"  y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="6"  y1="6"  x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>

            <div id="naTopCenter">
              <span className="naTopTitle">NutriAssist AI</span>
              <span className="naTopStatus">
                {voiceStateLabel || (hasApiKey
                  ? (isTa ? '🟢 ஆன்லைன்' : '🟢 Online')
                  : (isTa ? '🔑 API விசை தேவை' : '🔑 API key needed')
                )}
              </span>
            </div>

            <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
              {/* Clear chat */}
              <button
                onClick={handleClear}
                style={{
                  background:'rgba(255,255,255,0.15)', border:'none', color:'white',
                  borderRadius:'10px', padding:'5px 9px', fontSize:'11px',
                  fontWeight:'700', cursor:'pointer'
                }}
                title={isTa ? 'அழி' : 'Clear'}
              >
                {isTa ? 'அழி' : 'Clear'}
              </button>
              {/* Lang toggle */}
              <button id="naLangToggle" onClick={handleLangToggle} aria-label="Toggle language">
                <span className={!isTa ? 'naLangActive' : ''}>EN</span>
                <span className="naLangDiv">|</span>
                <span className={ isTa ? 'naLangActive' : ''}>தமிழ்</span>
              </button>
            </div>
          </div>

          {/* ══ AVATAR ══ */}
          <div id="naAvatar">
            <div className={`naAvatarOrb ${voiceState !== VOICE_IDLE ? 'orb-active' : ''}`}>
              {voiceState !== VOICE_IDLE && (
                <><div className="waveRing r1"/><div className="waveRing r2"/><div className="waveRing r3"/></>
              )}
              <div className="naAvatarCore">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)"/>
                  <path d="M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3z" fill="white"/>
                  <path d="M17 11v1a5 5 0 0 1-10 0v-1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="9"  y1="20" x2="15" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="naAvatarInfo">
              <div className="naAvatarName">NutriAssist AI</div>
              <div className="naAvatarSub">
                {isTa ? 'உங்கள் விவசாய உதவியாளர்' : 'Your Smart Farming Assistant'}
              </div>
            </div>
          </div>

          {/* ══ API KEY WARNING ══ */}
          {!hasApiKey && (
            <div style={{
              margin:'0 14px 4px', padding:'10px 14px', background:'#FFF8E1',
              border:'1.5px solid #FFD54F', borderRadius:'14px',
              fontSize:'12px', color:'#7B5800', fontWeight:'600',
              display:'flex', alignItems:'center', gap:'8px', flexShrink:0
            }}>
              <span style={{fontSize:'16px'}}>🔑</span>
              <span>
                {isTa
                  ? 'AI-ஐ பயன்படுத்த Settings இல் Groq API விசை சேமிக்கவும்.'
                  : 'Add your Groq API key in Settings to enable AI responses.'}
              </span>
            </div>
          )}

          {/* ══ CHAT BODY ══ */}
          <div id="naBody" ref={bodyRef}>

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`naMsg ${msg.sender === 'user' ? 'naMsgUser' : 'naMsgBot'}`}>
                {msg.sender === 'bot' && <div className="naBotAvatar">🌱</div>}
                <div className="naMsgBubble" style={
                  msg.isError ? { background:'#FEF2F2', borderColor:'#FCA5A5' } : {}
                }>
                  {msg.isVoice && (
                    <span className="naVoiceTag">🎙️ {isTa ? 'குரல்' : 'Voice'}</span>
                  )}
                  <span className="naMsgText" style={msg.isError ? { color:'#7F1D1D' } : {}}>
                    {msg.text}
                  </span>
                  <span className="naMsgTime">{now}</span>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="naMsg naMsgBot">
                <div className="naBotAvatar">🌱</div>
                <div className="naMsgBubble naTypingBubble">
                  <span className="naTypingText">
                    {isTa ? 'NutriAssist சிந்திக்கிறது' : 'NutriAssist is thinking'}
                  </span>
                  <span className="naTypingDots">
                    <span/><span/><span/>
                  </span>
                </div>
              </div>
            )}

            {/* Live STT transcript bubble */}
            {voiceState === VOICE_LISTENING && transcript && (
              <div className="naMsg naMsgUser">
                <div className="naMsgBubble" style={{ opacity:0.6, fontStyle:'italic' }}>
                  <span className="naMsgText">🎙️ {transcript}</span>
                </div>
              </div>
            )}

            {/* Voice state banner */}
            {voiceState !== VOICE_IDLE && (
              <div className={`naVoiceBanner vb-${voiceState}`}>
                {voiceState === VOICE_LISTENING && (
                  <div className="naWaveform">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="naWaveBar" style={{ animationDelay:`${i*0.07}s` }}/>
                    ))}
                  </div>
                )}
                <span>{voiceStateLabel}</span>
              </div>
            )}

            {/* Suggested chips — shown until user sends first message */}
            {!userHasSpoken && voiceState === VOICE_IDLE && !isThinking && (
              <div className="naSuggestions">
                <div className="naSugTitle">
                  {isTa ? '💡 விரைவு கேள்விகள்' : '💡 Suggested Questions'}
                </div>
                <div className="naSugGrid">
                  {CHIPS[lang].map((chip, i) => (
                    <button key={i} className="naSugChip" onClick={() => handleChip(chip)}>
                      <span className="naSugIcon">{chip.icon}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══ FOOTER ══ */}
          <div id="naFooter">
            {/* Text input row */}
            <div id="naInputRow">
              <input
                ref={inputRef}
                id="naInput"
                type="text"
                placeholder={isTa ? 'எதுவும் கேளுங்கள்...' : 'Ask about your farm...'}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isThinking || voiceState !== VOICE_IDLE}
                autoComplete="off"
              />
              <button
                id="naSendBtn"
                onClick={() => handleSend(inputVal)}
                disabled={!inputVal.trim() || isThinking || voiceState !== VOICE_IDLE}
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Action row: Speaker | BIG MIC | STT info */}
            <div id="naActionRow">

              {/* Speaker button */}
              <button
                className={`naActionBtn ${voiceState === VOICE_SPEAKING ? 'naActionActive' : ''}`}
                onClick={handleSpeaker}
                title={isTa ? 'மீண்டும் பேசு' : 'Replay last reply'}
                aria-label="Speaker"
              >
                {voiceState === VOICE_SPEAKING
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
                      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
                    </svg>
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                }
                <span>{voiceState === VOICE_SPEAKING ? (isTa ? 'நிறுத்து' : 'Stop') : (isTa ? 'பேசு' : 'Speak')}</span>
              </button>

              {/* Large Mic Button */}
              <button
                id="naMicBtn"
                className={voiceState === VOICE_LISTENING ? 'mic-listening' : ''}
                onClick={handleMicTap}
                disabled={voiceState === VOICE_PROCESSING || voiceState === VOICE_SPEAKING || isThinking}
                aria-label={voiceState === VOICE_LISTENING ? 'Stop' : 'Start voice input'}
              >
                {voiceState === VOICE_LISTENING && <span className="micPulseRing"/>}

                {voiceState === VOICE_LISTENING
                  ? /* Stop icon */
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <rect x="6" y="6" width="12" height="12" rx="2" fill="white"/>
                    </svg>
                  : /* Mic icon */
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                      <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                      <line x1="8"  y1="23" x2="16" y2="23" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                }

                <span className="micLabel">
                  {voiceState === VOICE_LISTENING
                    ? (isTa ? 'நிறுத்து' : 'Stop')
                    : (isTa ? 'பேசுங்கள்' : 'Speak')}
                </span>
              </button>

              {/* Browser support info / Questions toggle */}
              <button
                className="naActionBtn"
                onClick={() => {
                  /* scroll to top of body to show chips */
                  if (bodyRef.current) bodyRef.current.scrollTop = 0;
                }}
                title={isTa ? 'மேலே செல்' : 'Scroll to questions'}
                aria-label="Scroll to suggestions"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{isTa ? 'கேள்விகள்' : 'Questions'}</span>
              </button>
            </div>

            {/* STT not supported warning */}
            {!sttSupported && (
              <div style={{ textAlign:'center', fontSize:'10px', color:'#9CA3AF', marginTop:'2px' }}>
                {isTa
                  ? '⚠️ Voice input Chrome/Edge-ல் மட்டும் வேலை செய்யும்'
                  : '⚠️ Voice input works best in Chrome or Edge'}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
