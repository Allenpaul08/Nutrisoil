import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const HistoryCard = ({ title, statusText, score, onPdfExport }) => {
  const { dict } = useLanguage();

  return (
    <div className="info-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px' }}>{title || dict.histItemTitle}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{statusText || dict.histItemSub}</div>
        </div>
        <span
          className="material-symbols-outlined"
          style={{ color: '#D32F2F', cursor: 'pointer' }}
          title="Download PDF"
          onClick={onPdfExport || (() => alert('Exporting PDF Soil Report...'))}
        >
          picture_as_pdf
        </span>
      </div>
    </div>
  );
};

export default HistoryCard;
