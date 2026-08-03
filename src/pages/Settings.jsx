import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { connectESP32BLE } from '../services/hardware';

const GROQ_KEY_STORAGE = 'nutrisoil_groq_api_key';

const Settings = () => {
  const { dict } = useLanguage();
  const { isLiveHardware, toggleHardwareMode } = useHardware();

  const [groqKey, setGroqKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  // Load saved key on mount
  useEffect(() => {
    const saved = localStorage.getItem(GROQ_KEY_STORAGE) || '';
    setGroqKey(saved);
    setKeySaved(!!saved);
  }, []);

  const handleToggle = async (e) => {
    const checked = e.target.checked;
    if (checked) {
      const connected = await connectESP32BLE();
      if (!connected) {
        alert('BLE device not connected. Reverting to prototype mode.');
        toggleHardwareMode(false);
        return;
      }
    }
    toggleHardwareMode(checked);
  };

  const handleGroqKeyChange = (e) => {
    const val = e.target.value;
    setGroqKey(val);
    setKeySaved(false);
  };

  const handleSaveKey = () => {
    const trimmed = groqKey.trim();
    localStorage.setItem(GROQ_KEY_STORAGE, trimmed);
    setGroqKey(trimmed);
    setKeySaved(true);
  };

  const handleClearKey = () => {
    localStorage.removeItem(GROQ_KEY_STORAGE);
    setGroqKey('');
    setKeySaved(false);
  };

  const hasKey = groqKey.trim().length > 0;

  return (
    <div className="screen">
      {/* Hardware Settings Card */}
      <div className="info-card">
        <div className="info-card-title">{dict.settHwTitle}</div>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{dict.settEnableLive}</span>
          <input
            type="checkbox"
            id="hwToggle"
            checked={isLiveHardware}
            onChange={handleToggle}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          {isLiveHardware ? dict.hwDescLive : dict.hwDescSim}
        </p>
      </div>

      {/* AI Configuration Card */}
      <div className="info-card" style={{ border: '1px solid #C8E6C9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', flexShrink: 0
          }}>🤖</div>
          <div>
            <div className="info-card-title">{dict.settAiTitle}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Powered by Groq · llama3-8b-8192
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '20px', marginBottom: '14px',
          background: hasKey ? '#E8F5E9' : '#FFF8E1',
          border: `1px solid ${hasKey ? '#A5D6A7' : '#FFD54F'}`,
          fontSize: '12px', fontWeight: '600',
          color: hasKey ? '#2E7D32' : '#F59E0B',
        }}>
          <span>{hasKey ? '●' : '○'}</span>
          <span>{hasKey ? (keySaved ? dict.settGroqSaved : 'Unsaved changes') : dict.settGroqEmpty}</span>
        </div>

        {/* API key input row */}
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '8px' }}>
          {dict.settGroqLabel}
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              id="groqApiKeyInput"
              type={showKey ? 'text' : 'password'}
              value={groqKey}
              onChange={handleGroqKeyChange}
              placeholder={dict.settGroqPlaceholder}
              style={{
                width: '100%', padding: '12px 40px 12px 12px',
                border: `1.5px solid ${hasKey ? '#A5D6A7' : '#E5E7EB'}`,
                borderRadius: '12px', fontSize: '13px',
                background: '#FAFAFA', color: 'var(--text-dark)',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowKey((s) => !s)}
              style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: '16px',
                padding: '4px', color: 'var(--text-muted)',
                borderRadius: '6px',
              }}
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Save / Clear buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            id="saveGroqKeyBtn"
            onClick={handleSaveKey}
            disabled={!hasKey || keySaved}
            style={{
              flex: 1, padding: '11px', borderRadius: '12px',
              background: (!hasKey || keySaved) ? '#E5E7EB' : 'var(--primary-green)',
              color: (!hasKey || keySaved) ? 'var(--text-muted)' : 'white',
              fontWeight: '700', fontSize: '13px', border: 'none',
              cursor: (!hasKey || keySaved) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {keySaved ? '✓ Saved' : 'Save Key'}
          </button>
          {hasKey && (
            <button
              id="clearGroqKeyBtn"
              onClick={handleClearKey}
              style={{
                padding: '11px 16px', borderRadius: '12px',
                background: '#FEF2F2', color: '#EF4444',
                fontWeight: '600', fontSize: '13px',
                border: '1px solid #FCA5A5', cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Help text */}
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: '1.5' }}>
          🔑 {dict.settGroqHelp} —{' '}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer"
            style={{ color: 'var(--primary-green)', textDecoration: 'none', fontWeight: '600' }}>
            console.groq.com
          </a>
          <br />
          🔒 Your key is stored locally only, never sent to any server.
        </p>
      </div>
    </div>
  );
};

export default Settings;
