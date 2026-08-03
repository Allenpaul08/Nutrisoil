import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Irrigation = () => {
  const { dict } = useLanguage();

  return (
    <div className="screen">
      <div className="info-card" style={{ background: 'linear-gradient(135deg, #0288D1, #01579B)', color: 'white', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>water_drop</span>
        <div style={{ fontSize: '14px', marginTop: '6px' }}>{dict.irriTitle}</div>
        <div style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0' }}>{dict.irriVolume}</div>
        <span className="gold-badge">{dict.irriSavings}</span>
      </div>

      <div className="info-card">
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#0288D1' }}>schedule</span>
          <span className="info-card-title">{dict.irriNextHeader}</span>
        </div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-dark)' }}>{dict.irriNextText}</p>
      </div>
    </div>
  );
};

export default Irrigation;
