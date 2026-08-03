import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const CropCard = ({
  cropName,
  matchRate,
  yieldText,
  weatherText,
  waterText,
  fertText,
  isPrimary = false
}) => {
  const { isTa } = useLanguage();

  return (
    <div
      className="info-card"
      style={{
        borderLeft: isPrimary ? '4px solid var(--primary-green)' : '1px solid #E8F5E9',
        marginBottom: '14px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-dark)' }}>{cropName}</div>
        <span
          style={{
            background: isPrimary ? 'var(--primary-green)' : '#E5E7EB',
            color: isPrimary ? 'white' : 'var(--text-dark)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700'
          }}
        >
          {matchRate}
        </span>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.6' }}>
        <div><strong>{isTa ? 'எதிர்பார்க்கப்படும் விளைச்சல்:' : 'Expected Yield:'}</strong> {yieldText}</div>
        {weatherText && <div><strong>{isTa ? 'வானிலை பொருத்தம்:' : 'Weather Compatibility:'}</strong> {weatherText}</div>}
        {waterText && <div><strong>{isTa ? 'நீர் தேவை:' : 'Water Requirement:'}</strong> {waterText}</div>}
        {fertText && <div><strong>{isTa ? 'பரிந்துரைக்கப்படும் உரம்:' : 'Fertilizer:'}</strong> {fertText}</div>}
      </div>
    </div>
  );
};

export default CropCard;
