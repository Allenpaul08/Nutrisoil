import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const CarbonCard = () => {
  const { dict } = useLanguage();

  return (
    <div>
      <div className="info-card" style={{ background: 'linear-gradient(135deg, #2E7D32, #004D40)', color: 'white', textAlign: 'center', marginBottom: '14px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '54px' }}>co2</span>
        <div style={{ fontSize: '24px', fontWeight: '800' }}>{dict.co2Val}</div>
        <div style={{ fontSize: '14px', color: 'var(--accent-gold)', marginTop: '4px' }}>{dict.sustainRating}</div>
      </div>

      <div className="section-title">{dict.carbonRoadmapTitle}</div>
      <div className="info-card">
        <p
          style={{ fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line' }}
          dangerouslySetInnerHTML={{ __html: dict.carbonRoadmapText }}
        />
      </div>
    </div>
  );
};

export default CarbonCard;
