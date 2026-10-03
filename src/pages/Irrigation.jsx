import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';

const Irrigation = () => {
  const { dict, isTa } = useLanguage();
  const { sensorState } = useHardware();

  const moisture = parseFloat(sensorState?.moisture) || 0;
  const temp = parseFloat(sensorState?.temperature) || 0;

  // Dynamic Irrigation Logic based on live soil moisture & temperature
  let volumeText = dict.irriVolume;
  let nextText = dict.irriNextText;
  let savingsBadge = dict.irriSavings;

  if (moisture < 30) {
    volumeText = isTa ? '8,500 லிட்டர் / ஏக்கர்' : '8,500 Liters / Acre';
    nextText = isTa
      ? `இன்று மாலை (6:00 PM) • 45 நிமிடங்கள் சொட்டுநீர் பாசனம் (மண் ஈரம்: ${moisture.toFixed(1)}%, வெப்பநிலை: ${temp.toFixed(1)}°C)`
      : `Today Evening (6:00 PM) • 45 mins drip irrigation (Soil Moisture: ${moisture.toFixed(1)}%, Temp: ${temp.toFixed(1)}°C)`;
    savingsBadge = isTa ? '30% நீர் சேமிப்பு' : '30% Water Savings';
  } else if (moisture <= 60) {
    volumeText = isTa ? '6,500 லிட்டர் / ஏக்கர்' : '6,500 Liters / Acre';
    nextText = isTa
      ? `நாளை காலை (6:00 AM) • 30 நிமிடங்கள் சொட்டுநீர் பாசனம் (மண் ஈரம்: ${moisture.toFixed(1)}%, வெப்பநிலை: ${temp.toFixed(1)}°C)`
      : `Tomorrow Morning (6:00 AM) • 30 mins drip irrigation (Soil Moisture: ${moisture.toFixed(1)}%, Temp: ${temp.toFixed(1)}°C)`;
    savingsBadge = isTa ? '35% நீர் சேமிப்பு' : '35% Water Savings';
  } else {
    volumeText = isTa ? '0 லிட்டர் (ஈரப்பதம் போதுமானது)' : '0 Liters (Moisture Adequate)';
    nextText = isTa
      ? `பாசனம் தேவையில்லை • 2 நாட்களில் மறுபரிசீலனை செய்யப்பட உள்ளது (மண் ஈரம்: ${moisture.toFixed(1)}%)`
      : `No Irrigation Required • Re-evaluate in 2 Days (Soil Moisture: ${moisture.toFixed(1)}%)`;
    savingsBadge = isTa ? '50% நீர் சேமிப்பு' : '50% Water Savings';
  }

  return (
    <div className="screen">
      <div className="info-card" style={{ background: 'linear-gradient(135deg, #0288D1, #01579B)', color: 'white', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>water_drop</span>
        <div style={{ fontSize: '14px', marginTop: '6px' }}>{dict.irriTitle}</div>
        <div style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0' }}>{volumeText}</div>
        <span className="gold-badge">{savingsBadge}</span>
      </div>

      <div className="info-card">
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#0288D1' }}>schedule</span>
          <span className="info-card-title">{dict.irriNextHeader}</span>
        </div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-dark)' }}>{nextText}</p>
      </div>
    </div>
  );
};

export default Irrigation;
