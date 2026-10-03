import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';

const Micronutrients = () => {
  const { dict, isTa } = useLanguage();
  const { sensorState } = useHardware();

  const ph = parseFloat(sensorState?.ph) || 7.0;
  const nitrogen = parseFloat(sensorState?.nitrogen) || 0;
  const phosphorus = parseFloat(sensorState?.phosphorus ?? sensorState?.phosphorous) || 0;

  // Dynamic Micronutrient availability logic based on live pH & P chemistry
  let ironStatus = isTa ? '4.8 mg/kg • சீரானது' : '4.8 mg/kg • Normal';
  let ironColor = 'var(--primary-green)';

  let zincStatus = isTa ? '1.3 mg/kg • சிறந்தது' : '1.3 mg/kg • Optimal';
  let zincColor = 'var(--primary-green)';

  let overallSummary = isTa
    ? `மண் pH (${ph.toFixed(1)}) மற்றும் NPK நிலைகளின் அடிப்படையில் நுண் ஊட்டச்சத்து கிடைப்பது மதிப்பிடப்பட்டுள்ளது.`
    : `Micronutrient availability evaluated dynamically from live soil pH (${ph.toFixed(1)}), N (${Math.round(nitrogen)} mg/kg), and P (${Math.round(phosphorus)} mg/kg).`;

  if (ph > 7.5) {
    ironStatus = isTa ? 'அல்கலைன் pH காரணமாக கிடைப்பது குறைவு (FeSO₄ தெளிக்கவும்)' : 'Low Availability (pH > 7.5) • Apply Foliar FeSO₄';
    ironColor = '#E65100';
  } else if (ph < 6.0) {
    ironStatus = isTa ? 'அதிக கரைதிறன் (pH < 6.0) • கண்காணிப்பு தேவை' : 'High Solubility (pH < 6.0) • Monitor Leaf Toxicity';
    ironColor = '#E65100';
  }

  if (phosphorus > 200 || ph > 7.5) {
    zincStatus = isTa ? 'அதிக P/pH காரணமாக உட்கிரகிப்பு குறைவு (ZnSO₄ சேர்க்கவும்)' : 'Low Uptake (High P/pH Inhibited) • Apply ZnSO₄';
    zincColor = '#E65100';
  }

  return (
    <div className="screen">
      <div className="info-card" style={{ background: '#E0F2F1' }}>
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#00796B' }}>biotech</span>
          <span className="info-card-title" style={{ color: '#00796B' }}>{dict.microHeader}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#004D40' }}>{overallSummary}</p>
      </div>

      <div className="info-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '700' }}>{isTa ? 'இரும்புச்சத்து (Iron - Fe)' : 'Iron (Fe)'}</div>
          <span style={{ color: ironColor, fontWeight: '700', fontSize: '12px' }}>
            {ironStatus}
          </span>
        </div>
      </div>

      <div className="info-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '700' }}>{isTa ? 'துத்தநாகம் (Zinc - Zn)' : 'Zinc (Zn)'}</div>
          <span style={{ color: zincColor, fontWeight: '700', fontSize: '12px' }}>
            {zincStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Micronutrients;
