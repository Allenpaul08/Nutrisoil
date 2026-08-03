import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';

const WeatherCard = () => {
  const { isTa } = useLanguage();
  const { sensorState } = useHardware();

  return (
    <div className="info-card" style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: 'white', marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>{isTa ? 'தற்போதைய வானிலை' : 'Current Climate'}</div>
          <div style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0' }}>
            {sensorState.temperature}°C
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            {isTa ? 'தஞ்சாவூர் • பகுதி மேகமூட்டம்' : 'Thanjavur • Partly Cloudy'}
          </div>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--accent-gold)' }}>
          partly_cloudy_day
        </span>
      </div>
    </div>
  );
};

export default WeatherCard;
