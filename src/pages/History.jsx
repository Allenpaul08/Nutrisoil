import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import HistoryCard from '../components/HistoryCard';

const History = () => {
  const { dict } = useLanguage();

  return (
    <div className="screen active" id="history-screen">
      <div className="section-title">{dict.histTitle}</div>
      <HistoryCard
        title={dict.histItemTitle}
        statusText={dict.histItemSub}
        onPdfExport={() => alert('Exporting PDF Soil Report...')}
      />
    </div>
  );
};

export default History;
