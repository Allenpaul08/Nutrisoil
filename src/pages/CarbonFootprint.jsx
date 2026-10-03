import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';

const CarbonFootprint = () => {
  const { dict, isTa } = useLanguage();
  const { sensorState, mlResult } = useHardware();

  const nitrogen = parseFloat(sensorState?.nitrogen) || 0;
  const moisture = parseFloat(sensorState?.moisture) || 0;

  // Dynamic carbon footprint estimate from live NPK & drip irrigation volume
  const nRate = nitrogen > 0 ? nitrogen : 120;
  const waterVolume = moisture < 30 ? 8500 : (moisture <= 60 ? 6500 : 0);

  // Carbon math: N fertilizer emission (~1.8 kg CO2e / kg N) + Drip pumping (~0.4 kg CO2e / 1,000 L)
  const estimatedCo2Kg = Math.round((nRate * 1.8) + ((waterVolume / 1000) * 0.4));
  const estimatedCo2Tons = (estimatedCo2Kg / 1000).toFixed(2);

  const co2ValDisplay = isTa
    ? `${estimatedCo2Tons} டன் CO₂e / ஏக்கர் (மதிப்பீடு)`
    : `${estimatedCo2Tons} Tons CO₂e / Acre (Estimated)`;

  let sustainRating = isTa ? 'A+ உயர் நிலைத்தன்மை' : 'A+ High Sustainability Rating';
  if (estimatedCo2Kg > 400) {
    sustainRating = isTa ? 'B நிலைத்தன்மை (நைட்ரஜன் உமிழ்வு குறைக்கப்பட வேண்டும்)' : 'B Rating (Nitrogen Optimization Recommended)';
  } else if (estimatedCo2Kg > 250) {
    sustainRating = isTa ? 'A மிதமான நிலைத்தன்மை' : 'A Moderate Sustainability Rating';
  }

  const roadmapText = isTa
    ? `<b>கார্বন தடம் கணக்கீடு முறை:</b><br>• ESP32 சென்சார்கள் மண்ணின் இயற்பியல் அளவீடுகளை (N, P, K, pH, ஈரம்) நேரடியாக அளவிடுகின்றன.<br>• இந்த கார்பன் தடம் நேரடி நைட்ரஜன் அளவு (${Math.round(nitrogen)} mg/kg) மற்றும் பாசன நீர் பயன்பாடு (${waterVolume} L/Acre) ஆகியவற்றிலிருந்து பெறப்பட்ட தோராய மதிப்பீடாகும்.<br><br><b>நிலையான விவசாயப் பரிந்துரைகள்:</b><br>• வேப்ப பூசப்பட்ட யூரியாவைப் பயன்படுத்தி N₂O கிரீன்ஹவுஸ் வாயு உமிழ்வைக் குறைக்கவும்.<br>• சொட்டுநீர் பாசனம் மூலம் மின்சார மற்றும் நீர் பயன்பாட்டு உமிழ்வைக் கட்டுப்படுத்தவும்.`
    : `<b>Carbon Estimation Methodology:</b><br>• ESP32 sensors measure physical soil chemistry (N, P, K, pH, Moisture, Temp).<br>• This carbon footprint is a calculated estimate derived from live Nitrogen application (${Math.round(nitrogen)} mg/kg) and precision drip volume (${waterVolume} L/Acre).<br><br><b>Sustainable Farming Recommendations:</b><br>• Use Neem-coated Urea to prevent N₂O greenhouse gas release.<br>• Maintain precision drip irrigation to minimize pumping energy emissions.`;

  return (
    <div className="screen">
      <div className="info-card" style={{ background: 'linear-gradient(135deg, #2E7D32, #004D40)', color: 'white', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '54px' }}>co2</span>
        <div style={{ fontSize: '24px', fontWeight: '800' }}>{co2ValDisplay}</div>
        <div style={{ fontSize: '14px', color: 'var(--accent-gold)', marginTop: '4px' }}>{sustainRating}</div>
      </div>

      <div className="section-title">{dict.carbonRoadmapTitle}</div>
      <div className="info-card">
        <p
          style={{ fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line' }}
          dangerouslySetInnerHTML={{ __html: roadmapText }}
        />
      </div>
    </div>
  );
};

export default CarbonFootprint;
