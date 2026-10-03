import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { getScanHistory } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const AnalyticsChart = () => {
  const { dict, isTa } = useLanguage();
  const { sensorState } = useHardware();
  const [historyRecords, setHistoryRecords] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const res = await getScanHistory();
        if (!isMounted) return;

        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Slice latest 10 records and reverse for chronological timeline
          const sliced = res.data.slice(0, 10).reverse();
          setHistoryRecords(sliced);
        }
      } catch (err) {
        console.warn('[AnalyticsChart] History fetch error:', err);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentScore      = parseFloat(sensorState.score)                             || 84.5;
  const currentMoisture   = parseFloat(sensorState.moisture)                          || 0;
  const currentPh         = parseFloat(sensorState.ph)                                || 7.0;
  const currentNitrogen   = parseFloat(sensorState.nitrogen)                          || 0;
  const currentPhosphor   = parseFloat(sensorState.phosphorus ?? sensorState.phosphorous) || 0;
  const currentPotassium  = parseFloat(sensorState.potassium)                         || 0;
  const currentTemp       = parseFloat(sensorState.temperature)                       || 0;

  const hasHistory = historyRecords.length > 0;

  const formatTime = (ts, id) => {
    if (!ts) return `#${id || ''}`;
    const parts = ts.split(' ');
    return parts[1] ? parts[1].slice(0, 5) : ts.slice(-5);
  };

  const healthData = hasHistory
    ? historyRecords.map((r) => {
        let sc = 100.0;
        const phVal = parseFloat(r.ph) || 7.0;
        const mVal = parseFloat(r.moisture) || 0;
        const nVal = parseFloat(r.nitrogen) || 0;
        if (phVal < 6.0) sc -= (6.0 - phVal) * 15.0;
        if (phVal > 7.5) sc -= (phVal - 7.5) * 15.0;
        if (mVal < 40) sc -= (40 - mVal) * 0.8;
        if (nVal < 120) sc -= (120 - nVal) * 0.2;
        return { name: formatTime(r.timestamp, r.id), value: parseFloat(Math.max(10, Math.min(99, sc)).toFixed(1)) };
      })
    : [{ name: isTa ? 'இன்று' : 'Today', value: currentScore }];

  const moistureData = hasHistory
    ? historyRecords.map((r) => ({ name: formatTime(r.timestamp, r.id), value: parseFloat(r.moisture) || 0 }))
    : [{ name: isTa ? 'இன்று' : 'Today', value: currentMoisture }];

  const phData = hasHistory
    ? historyRecords.map((r) => ({ name: formatTime(r.timestamp, r.id), value: parseFloat(r.ph) || 7.0 }))
    : [{ name: isTa ? 'இன்று' : 'Today', value: currentPh }];

  const nitrogenData = hasHistory
    ? historyRecords.map((r) => ({ name: formatTime(r.timestamp, r.id), value: parseFloat(r.nitrogen) || 0 }))
    : [{ name: isTa ? 'இன்று' : 'Today', value: currentNitrogen }];

  const phosphorousData = hasHistory
    ? historyRecords.map((r) => ({ name: formatTime(r.timestamp, r.id), value: parseFloat(r.phosphorus ?? r.phosphorous) || 0 }))
    : [{ name: isTa ? 'இன்று' : 'Today', value: currentPhosphor }];

  const potassiumData = hasHistory
    ? historyRecords.map((r) => ({ name: formatTime(r.timestamp, r.id), value: parseFloat(r.potassium) || 0 }))
    : [{ name: isTa ? 'இன்று' : 'Today', value: currentPotassium }];

  const temperatureData = hasHistory
    ? historyRecords.map((r) => ({ name: formatTime(r.timestamp, r.id), value: parseFloat(r.temperature) || 0 }))
    : [{ name: isTa ? 'இன்று' : 'Today', value: currentTemp }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Soil Health Trend Chart */}
      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '14px', color: '#2E7D32' }}>
          📈 {dict.chartTitle}
        </div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #C8E6C9',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={isTa ? 'மண் சுகாதார மதிப்பெண்' : 'Soil Health Score'}
                stroke="#2E7D32"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2E7D32' }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Moisture Trend Chart */}
      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '14px', color: '#1976D2' }}>
          💧 {isTa ? 'மண் ஈரம் வரைபடம் (Moisture Trend)' : 'Soil Moisture Trend (%)'}
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moistureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #BBDEFB'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={isTa ? 'மண் ஈரம் (%)' : 'Moisture (%)'}
                stroke="#1976D2"
                strokeWidth={3}
                dot={{ r: 4, fill: '#1976D2' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. pH Trend Chart */}
      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '14px', color: '#7B1FA2' }}>
          🧪 {isTa ? 'மண் pH வரைபடம் (pH Trend)' : 'Soil pH Trend'}
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={phData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E5F5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E1BEE7'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={isTa ? 'மண் pH' : 'Soil pH'}
                stroke="#7B1FA2"
                strokeWidth={3}
                dot={{ r: 4, fill: '#7B1FA2' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Nitrogen Trend Chart */}
      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '14px', color: '#388E3C' }}>
          🌱 {isTa ? 'நைட்ரஜன் வரைபடம் (Nitrogen Trend)' : 'Nitrogen Trend (mg/kg)'}
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={nitrogenData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #C8E6C9'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={isTa ? 'நைட்ரஜன் (mg/kg)' : 'Nitrogen (mg/kg)'}
                stroke="#388E3C"
                strokeWidth={3}
                dot={{ r: 4, fill: '#388E3C' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Phosphorous Trend Chart */}
      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '14px', color: '#C62828' }}>
          🌸 {isTa ? 'பாஸ்பரஸ் வரைபடம் (Phosphorous Trend)' : 'Phosphorous Trend (mg/kg)'}
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={phosphorousData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FCE4EC" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F48FB1'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={isTa ? 'பாஸ்பரஸ் (mg/kg)' : 'Phosphorous (mg/kg)'}
                stroke="#C62828"
                strokeWidth={3}
                dot={{ r: 4, fill: '#C62828' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Potassium Trend Chart */}
      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '14px', color: '#283593' }}>
          🪴 {isTa ? 'பொட்டாசியம் வரைபடம் (Potassium Trend)' : 'Potassium Trend (mg/kg)'}
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={potassiumData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #9FA8DA'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={isTa ? 'பொட்டாசியம் (mg/kg)' : 'Potassium (mg/kg)'}
                stroke="#283593"
                strokeWidth={3}
                dot={{ r: 4, fill: '#283593' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Temperature Trend Chart */}
      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '14px', color: '#F57F17' }}>
          🌡️ {isTa ? 'மண் வெப்பநிலை வரைபடம் (Temperature Trend)' : 'Soil Temperature Trend (°C)'}
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={temperatureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFF8E1" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #FFE082'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={isTa ? 'வெப்பநிலை (°C)' : 'Temperature (°C)'}
                stroke="#F57F17"
                strokeWidth={3}
                dot={{ r: 4, fill: '#F57F17' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
