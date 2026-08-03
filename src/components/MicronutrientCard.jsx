import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const MicronutrientCard = () => {
  const { dict, isTa } = useLanguage();

  return (
    <div>
      <div className="info-card" style={{ background: '#E0F2F1', marginBottom: '14px' }}>
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#00796B' }}>biotech</span>
          <span className="info-card-title" style={{ color: '#00796B' }}>{dict.microHeader}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#004D40' }}>{dict.microOverall}</p>
      </div>

      <div className="info-card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '700' }}>{isTa ? 'இரும்புச்சத்து (Iron - Fe)' : 'Iron (Fe)'}</div>
          <span style={{ color: 'var(--primary-green)', fontWeight: '700', fontSize: '12px' }}>
            4.8 mg/kg • {isTa ? 'சீரானது' : 'Normal'}
          </span>
        </div>
      </div>

      <div className="info-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '700' }}>{isTa ? 'துத்தநாகம் (Zinc - Zn)' : 'Zinc (Zn)'}</div>
          <span style={{ color: 'var(--primary-green)', fontWeight: '700', fontSize: '12px' }}>
            1.3 mg/kg • {isTa ? 'சிறந்தது' : 'Optimal'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MicronutrientCard;
