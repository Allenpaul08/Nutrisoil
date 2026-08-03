import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import SensorCard from '../components/SensorCard';
import { analyzeSoilAI } from '../services/api';

const Scan = () => {
  const navigate = useNavigate();
  const { dict, isTa } = useLanguage();
  const { sensorState, updateSensors, setAiSummary } = useHardware();

  const handleMoistureChange = (e) => {
    updateSensors({ moisture: e.target.value });
  };

  const handlePhChange = (e) => {
    updateSensors({ ph: e.target.value });
  };

  const handleNitrogenChange = (e) => {
    updateSensors({ nitrogen: e.target.value });
  };

  const runAIAnalysis = async () => {
    // Call backend API placeholder, fallback to local summary calculation
    await analyzeSoilAI(sensorState);

    const summaryText = isTa
      ? `மண் சுகாதார மதிப்பெண் <b>${sensorState.score}</b>.<br><br>மண் ஈரம்: ${sensorState.moisture}%<br><br>pH: ${sensorState.ph}<br><br>நைட்ரஜன்: ${sensorState.nitrogen} mg/kg<br><br>மண் நல்ல நிலையில் உள்ளது.`
      : `Soil Health Score: <b>${sensorState.score}</b><br><br>Moisture: ${sensorState.moisture}%<br><br>pH: ${sensorState.ph}<br><br>Nitrogen: ${sensorState.nitrogen} mg/kg<br><br>Soil condition is healthy.`;

    setAiSummary(summaryText);
    navigate('/ai');
  };

  return (
    <div className="screen">
      <div className="cards-grid">
        <SensorCard
          title={dict.pTitleMoist}
          value={sensorState.moisture.toFixed(1)}
          unit="%"
          icon="water_drop"
          iconBg="#E3F2FD"
          iconColor="#1976D2"
        />

        <SensorCard
          title={dict.pTitlePh}
          value={sensorState.ph.toFixed(1)}
          unit="pH"
          icon="science"
          iconBg="#F3E5F5"
          iconColor="#7B1FA2"
        />

        <SensorCard
          title={dict.pTitleEc}
          value={sensorState.ec.toFixed(2)}
          unit="dS/m"
          icon="bolt"
          iconBg="#FFF3E0"
          iconColor="#E65100"
        />

        <SensorCard
          title={dict.pTitleN}
          value={Math.round(sensorState.nitrogen)}
          unit="mg/kg"
          icon="eco"
          iconBg="#E8F5E9"
          iconColor="#2E7D32"
        />
      </div>

      <div className="info-card">
        <div className="info-card-title">{dict.simTitle}</div>
        <br />

        <div className="slider-box">
          <div className="slider-row">
            <span>{dict.sldTitleMoist}</span>
            <span className="slider-val-badge">{Math.round(sensorState.moisture)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sensorState.moisture}
            onChange={handleMoistureChange}
          />
        </div>

        <div className="slider-box">
          <div className="slider-row">
            <span>{dict.sldTitlePh}</span>
            <span className="slider-val-badge">{sensorState.ph.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="4.0"
            max="9.0"
            step="0.1"
            value={sensorState.ph}
            onChange={handlePhChange}
          />
        </div>

        <div className="slider-box">
          <div className="slider-row">
            <span>{dict.sldTitleN}</span>
            <span className="slider-val-badge">{Math.round(sensorState.nitrogen)} mg/kg</span>
          </div>
          <input
            type="range"
            min="40"
            max="250"
            value={sensorState.nitrogen}
            onChange={handleNitrogenChange}
          />
        </div>

        <br />

        <button className="btn-primary" onClick={runAIAnalysis}>
          <span className="material-symbols-outlined">psychology</span>
          <span>{dict.btnRunAi}</span>
        </button>
      </div>
    </div>
  );
};

export default Scan;
