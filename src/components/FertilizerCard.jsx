import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';

const FertilizerCard = () => {
  const { dict, isTa } = useLanguage();
  const { sensorState } = useHardware();

  const scoreNum = parseFloat(sensorState.score) || 84.5;

  return (
    <div>
      {/* Targeted Fertilizer Banner */}
      <div className="info-card" style={{ background: 'linear-gradient(135deg, #1E88E5, #1565C0)', color: 'white', marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>{dict.fertRecipeHeader}</div>
        <div style={{ fontSize: '20px', fontWeight: '800', margin: '6px 0' }}>{dict.fertName}</div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-gold)' }}>{dict.fertQty}</div>
      </div>

      {/* NPK Status Grid */}
      <div className="cards-grid" style={{ marginBottom: '14px' }}>
        <div className="param-card">
          <div className="param-header">
            <span className="param-title">{isTa ? 'நைட்ரஜன் (N)' : 'Nitrogen (N)'}</span>
            <span className="material-symbols-outlined param-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}>eco</span>
          </div>
          <div className="param-val">{Math.round(sensorState.nitrogen)} <span className="param-unit">mg/kg</span></div>
        </div>

        <div className="param-card">
          <div className="param-header">
            <span className="param-title">{isTa ? 'பாஸ்பரஸ் (P)' : 'Phosphorus (P)'}</span>
            <span className="material-symbols-outlined param-icon" style={{ background: '#FFF3E0', color: '#E65100' }}>grain</span>
          </div>
          <div className="param-val">45 <span className="param-unit">mg/kg</span></div>
        </div>

        <div className="param-card">
          <div className="param-header">
            <span className="param-title">{isTa ? 'பொட்டாசியம் (K)' : 'Potassium (K)'}</span>
            <span className="material-symbols-outlined param-icon" style={{ background: '#E3F2FD', color: '#1976D2' }}>science</span>
          </div>
          <div className="param-val">180 <span className="param-unit">mg/kg</span></div>
        </div>

        <div className="param-card">
          <div className="param-header">
            <span className="param-title">{isTa ? 'கரிம உரம்' : 'Organic Alt'}</span>
            <span className="material-symbols-outlined param-icon" style={{ background: '#E0F2F1', color: '#00796B' }}>compost</span>
          </div>
          <div className="param-val" style={{ fontSize: '15px', fontWeight: '700' }}>{isTa ? 'வேப்பங் பிண்ணாக்கு' : 'Neem Cake'}</div>
        </div>
      </div>

      {/* Recommended Fertilizer & Quantity */}
      <div className="info-card" style={{ marginBottom: '14px' }}>
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#1565C0' }}>analytics</span>
          <span className="info-card-title">{dict.fertNpkHeader}</span>
        </div>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{dict.fertNpkText}</p>
        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <strong>{isTa ? 'இயற்கை மாற்று உரம்:' : 'Organic Alternative:'}</strong> {isTa ? 'மட்கிய தொழு உரம் (500 கிலோ/ஏக்கர்)' : 'Farmyard Vermicompost (500 kg/Acre)'}
        </div>
      </div>

      {/* Application Timing */}
      <div className="info-card" style={{ marginBottom: '14px' }}>
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#1565C0' }}>schedule</span>
          <span className="info-card-title">{dict.fertTimingHeader}</span>
        </div>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{dict.fertTimingText}</p>
      </div>

      {/* Warnings & Precautions */}
      <div className="info-card" style={{ background: '#FFF8E1', border: '1px solid #FFE082', marginBottom: '14px' }}>
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#F57F17' }}>warning</span>
          <span className="info-card-title" style={{ color: '#F57F17' }}>{isTa ? 'எச்சரிக்கைகள் & முன்னெச்சரிக்கை' : 'Warnings & Safety'}</span>
        </div>
        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#5D4037' }}>
          {isTa
            ? '• கனமழைக்கு முன் இரசாயன உரங்களை இட வேண்டாம்.\n• வேப்ப பூசப்பட்ட யூரியாவை பயன்படுத்தி பசுமை இல்ல வாயு உமிழ்வை தவிர்க்கவும்.'
            : '• Avoid chemical fertilizer application immediately prior to heavy rainfall.\n• Use Neem-coated Urea to prevent nitrogen loss and N₂O greenhouse gas release.'}
        </p>
      </div>

      {/* AI Dynamic Recommendation Callout */}
      <div className="info-card" style={{ background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#2E7D32' }}>auto_awesome</span>
          <span className="info-card-title" style={{ color: '#2E7D32' }}>{isTa ? 'AI உர ஆலோசனை' : 'AI Fertilizer Recommendation'}</span>
        </div>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#1B5E20' }}>
          {scoreNum >= 80
            ? (isTa ? 'மண் ஊட்டச்சத்து நிலைகள் மிகவும் சீராக உள்ளன. 25கிலோ/ஏக்கர் யூரியா மற்றும் இயற்கை உரமிடுதல் போதுமானது.' : 'Soil nutrients are highly balanced. 25kg/Acre Urea basal dose combined with organic compost is optimal.')
            : (isTa ? 'நைட்ரஜன் சத்தை அதிகரிக்க 30கிலோ/ஏக்கர் வேப்ப பூசப்பட்ட யூரியாவை 2 தவணைகளாக இடவும்.' : 'Increase Nitrogen levels by applying 30kg/Acre Neem-coated Urea split across 2 dosages.')}
        </p>
      </div>
    </div>
  );
};

export default FertilizerCard;
