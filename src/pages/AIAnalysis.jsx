import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import Gauge from '../components/Gauge';
import SoilTypeCard from '../components/SoilTypeCard';
import RecommendationCard from '../components/RecommendationCard';

const AIAnalysis = () => {
  const { dict, isTa } = useLanguage();
  const { sensorState, aiSummary } = useHardware();

  const scoreNum = parseFloat(sensorState.score) || 84.5;

  // Score Range Logic:
  // 80 - 100: Excellent Soil Recommendation
  // 60 - 79: Moderate Recommendation
  // Below 60: Critical Recommendation
  const getRecommendationDetails = () => {
    if (scoreNum >= 80) {
      return {
        title: isTa ? 'AI பரிந்துரை: சிறந்த மண் நிலை' : 'AI Recommendation: Excellent Soil Condition',
        description: isTa
          ? 'மண் ஊட்டச்சத்து நிலைகள் மிகச் சிறந்த அளவில் உள்ளன. தற்போதைய இயற்கை உரமிடுதல் மற்றும் சொட்டுநீர் பாசன முறையை தொடரவும்.'
          : 'Soil nutrient levels are in excellent range. Continue current organic fertilization routine and precision drip irrigation.',
        badge: isTa ? 'சிறந்த நிலை' : 'Excellent',
        icon: 'verified',
        iconColor: '#2E7D32',
        background: '#E8F5E9',
        riskText: isTa ? 'குறைந்த ஆபத்து' : 'Low Risk',
        riskColor: '#2E7D32'
      };
    } else if (scoreNum >= 60) {
      return {
        title: isTa ? 'AI பரிந்துரை: மிதமான மண் நிலை' : 'AI Recommendation: Moderate Soil Condition',
        description: isTa
          ? 'மண் ஈரம் அல்லது நைட்ரஜன் அளவு சற்று குறைவாக உள்ளது. யூரியா (25 கிலோ/ஏக்கர்) இட்டு பாசனத்தை அதிகரிக்கவும்.'
          : 'Soil moisture or Nitrogen levels are slightly lower than optimal target. Apply split dose Urea (25kg/Acre) and increase irrigation frequency.',
        badge: isTa ? 'மிதமான நிலை' : 'Moderate',
        icon: 'warning',
        iconColor: '#EF6C00',
        background: '#FFF3E0',
        riskText: isTa ? 'மிதமான ஆபத்து' : 'Moderate Risk',
        riskColor: '#EF6C00'
      };
    } else {
      return {
        title: isTa ? 'AI பரிந்துரை: அவசர மண் சிகிச்சை தேவை' : 'AI Recommendation: Critical Soil Warning',
        description: isTa
          ? 'மண் pH மற்றும் சத்து நிலைகள் மிகவும் குறைவாக உள்ளன! உடனடியாக ஜிப்சம்/சுண்ணாம்பு மற்றும் தொழு உரம் இடவும்.'
          : 'Critical nutrient deficiency or pH imbalance detected! Apply soil conditioner (lime/gypsum) and organic compost immediately.',
        badge: isTa ? 'அவசர நிலை' : 'Critical',
        icon: 'error',
        iconColor: '#C62828',
        background: '#FFEBEE',
        riskText: isTa ? 'அதிக ஆபத்து' : 'High Risk',
        riskColor: '#C62828'
      };
    }
  };

  const rec = getRecommendationDetails();

  return (
    <div className="screen active" id="ai-screen">
      {/* Animated Soil Health Gauge */}
      <Gauge score={sensorState.score} status={sensorState.status} titleKey="aiGaugeTitle" />

      {/* Soil Type Detection Module */}
      <SoilTypeCard />

      {/* AI Summary Card */}
      <div className="info-card">
        <div className="info-card-header">
          <span className="material-symbols-outlined" style={{ color: '#7B1FA2' }}>auto_awesome</span>
          <span className="info-card-title">{dict.aiSummaryHeader}</span>
        </div>

        <p
          style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-dark)' }}
          dangerouslySetInnerHTML={{
            __html: aiSummary || dict.aiSummaryText
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dict.lblRisk}</div>
            <div style={{ fontWeight: '700', color: rec.riskColor }}>{rec.riskText}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dict.lblConf}</div>
            <div style={{ fontWeight: '700', color: 'var(--primary-green)' }}>96.5%</div>
          </div>
        </div>
      </div>

      {/* AI Dynamic Recommendation Card */}
      <RecommendationCard
        title={rec.title}
        description={rec.description}
        badge={rec.badge}
        icon={rec.icon}
        iconColor={rec.iconColor}
        background={rec.background}
      />
    </div>
  );
};

export default AIAnalysis;
