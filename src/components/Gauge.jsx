import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Gauge = ({ score, status, titleKey = 'gaugeTitle' }) => {
  const { dict } = useLanguage();

  const numericScore = parseFloat(score) || 84.5;
  const conicBg = `conic-gradient(var(--primary-green) 0% ${numericScore}%, #E5E7EB ${numericScore}% 100%)`;

  let pillStyle = { background: '#E8F5E9', color: '#2E7D32' };
  if (status === 'FAIR') {
    pillStyle = { background: '#FFF3E0', color: '#F57C00' };
  } else if (status === 'CRITICAL') {
    pillStyle = { background: '#FFEBEE', color: '#C62828' };
  }

  return (
    <div className="gauge-container">
      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
        {dict[titleKey] || dict.gaugeTitle}
      </div>
      <div className="circle-gauge" style={{ background: conicBg }}>
        <div className="inner-circle">
          <span className="score-value">{score}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>
      <div className="status-pill" style={pillStyle}>
        {status}
      </div>
    </div>
  );
};

export default Gauge;
