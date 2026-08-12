import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import HeroBanner from '../components/HeroBanner';
import Gauge from '../components/Gauge';
import SensorCard from '../components/SensorCard';
import ActionCard from '../components/ActionCard';

const Home = () => {
  const navigate = useNavigate();
  const { dict } = useLanguage();
  const { sensorState } = useHardware();

  return (
    <div className="screen active" id="home-screen">
      {/* Welcome Card & Hero Banner */}
      <HeroBanner />

      {/* Soil Health Score Gauge */}
      <Gauge score={sensorState.score} status={sensorState.status} titleKey="gaugeTitle" />

      {/* Live Sensor Cards Grid */}
      <div className="cards-grid" style={{ marginBottom: '16px' }}>
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

        <SensorCard
          title={dict.pTitleP}
          value={Math.round(sensorState.phosphorous)}
          unit="mg/kg"
          icon="spa"
          iconBg="#FCE4EC"
          iconColor="#C62828"
        />

        <SensorCard
          title={dict.pTitleK}
          value={Math.round(sensorState.potassium)}
          unit="mg/kg"
          icon="potted_plant"
          iconBg="#E8EAF6"
          iconColor="#283593"
        />

        <SensorCard
          title={dict.pTitleTemp}
          value={sensorState.temperature.toFixed(1)}
          unit="°C"
          icon="thermostat"
          iconBg="#FFF8E1"
          iconColor="#F57F17"
        />
      </div>

      {/* Quick Action Modules Section */}
      <div className="section-title">
        <span id="quickTitle">{dict.quickTitle}</span>
      </div>

      <div className="grid-actions">
        <ActionCard
          icon="sensors"
          iconBg="#E8F5E9"
          iconColor="var(--primary-green)"
          label={dict.actScan}
          labelId="actScan"
          onClick={() => navigate('/scan')}
        />

        <ActionCard
          icon="psychology"
          iconBg="#F3E5F5"
          iconColor="#7B1FA2"
          label={dict.actAi}
          labelId="actAi"
          onClick={() => navigate('/ai')}
        />

        <ActionCard
          icon="agriculture"
          iconBg="#FFF8E1"
          iconColor="#F57F17"
          label={dict.actCrop}
          labelId="actCrop"
          onClick={() => navigate('/crop')}
        />

        <ActionCard
          icon="science"
          iconBg="#E3F2FD"
          iconColor="#1976D2"
          label={dict.actFert}
          labelId="actFert"
          onClick={() => navigate('/fertilizer')}
        />

        <ActionCard
          icon="biotech"
          iconBg="#E0F2F1"
          iconColor="#00796B"
          label={dict.actMicro}
          labelId="actMicro"
          onClick={() => navigate('/micronutrients')}
        />

        <ActionCard
          icon="water_drop"
          iconBg="#E1F5FE"
          iconColor="#0288D1"
          label={dict.actIrri}
          labelId="actIrri"
          onClick={() => navigate('/irrigation')}
        />

        <ActionCard
          icon="co2"
          iconBg="#E8F5E9"
          iconColor="#2E7D32"
          label={dict.actCarbon}
          labelId="actCarbon"
          onClick={() => navigate('/carbon')}
        />

        <ActionCard
          icon="history"
          iconBg="#EFEBE9"
          iconColor="#5D4037"
          label={dict.actHist}
          labelId="actHist"
          onClick={() => navigate('/history')}
        />

        <ActionCard
          icon="analytics"
          iconBg="#E8EAF6"
          iconColor="#303F9F"
          label={dict.actAnalytics}
          labelId="actAnalytics"
          onClick={() => navigate('/analytics')}
        />
      </div>
    </div>
  );
};

export default Home;
