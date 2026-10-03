import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getScanHistory } from '../services/api';
import HistoryCard from '../components/HistoryCard';

const History = () => {
  const { dict, isTa } = useLanguage();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const res = await getScanHistory();
        if (!isMounted) return;

        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setHistoryList(res.data);
        }
      } catch (err) {
        console.warn('[History] Error fetching scan history:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="screen active" id="history-screen">
      <div className="section-title">{dict.histTitle}</div>

      {historyList.length > 0 ? (
        historyList.map((item) => (
          <HistoryCard
            key={item.id || item.timestamp}
            title={`Scan #${item.id || ''} — ${item.timestamp || ''}`}
            statusText={`N: ${item.nitrogen ?? 0} | P: ${item.phosphorus ?? 0} | K: ${item.potassium ?? 0} | pH: ${item.ph ?? 7} | Temp: ${item.temperature ?? 0}°C`}
            onPdfExport={() => alert(`Exporting Soil Report for Scan #${item.id}...`)}
          />
        ))
      ) : (
        <HistoryCard
          title={loading ? (isTa ? 'வரலாறு ஏற்றப்படுகிறது...' : 'Loading history records...') : dict.histItemTitle}
          statusText={loading ? (isTa ? 'தயவுசெய்து காத்திருக்கவும்...' : 'Please wait...') : dict.histItemSub}
          onPdfExport={() => alert('Exporting Soil Report...')}
        />
      )}
    </div>
  );
};

export default History;
