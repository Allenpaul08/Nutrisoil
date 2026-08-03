import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import Gauge from '../components/Gauge';
import CropCard from '../components/CropCard';

const CropAdvisory = () => {
  const { isTa } = useLanguage();
  const { sensorState } = useHardware();

  return (
    <div className="screen active" id="crop-screen">
      {/* Display Soil Health Score Gauge */}
      <Gauge score={sensorState.score} status={sensorState.status} titleKey="gaugeTitle" />

      {/* Recommended Crops Header */}
      <div className="section-title">
        <span>{isTa ? 'பரிந்துரைக்கப்படும் பயிர்கள்' : 'Recommended Crops'}</span>
      </div>

      {/* Crop Card 1 - Paddy (Rice) */}
      <CropCard
        cropName={isTa ? 'நெல் (Paddy / Rice)' : 'Paddy (Rice)'}
        matchRate="95% Match"
        yieldText={isTa ? '2.8 - 3.2 டன் / ஏக்கர்' : '2.8 - 3.2 Tons / Acre'}
        weatherText={isTa ? '28.5°C • அதிக ஈரப்பதம் உகந்தது' : '28.5°C • High Humidity Compatible'}
        waterText={isTa ? '6,500 லிட்டர் / ஏக்கர் (சொட்டுநீர்)' : '6,500 Liters / Acre (Drip Irrigation)'}
        fertText={isTa ? 'யூரியா (46% N) & வேப்பங் பிண்ணாக்கு' : 'Urea (46% N) & Neem Cake'}
        isPrimary={true}
      />

      {/* Crop Card 2 - Sugarcane */}
      <CropCard
        cropName={isTa ? 'கரும்பு (Sugarcane)' : 'Sugarcane'}
        matchRate="88% Match"
        yieldText={isTa ? '40 - 45 டன் / ஏக்கர்' : '40 - 45 Tons / Acre'}
        weatherText={isTa ? 'சூடான மிதமான வானிலை' : 'Warm Moderate Climate'}
        waterText={isTa ? '9,000 லிட்டர் / ஏக்கர்' : '9,000 Liters / Acre'}
        fertText={isTa ? 'DAP, பொட்டாஷ் & தொழு உரம்' : 'DAP, Potash & Farmyard Manure'}
        isPrimary={false}
      />

      {/* Crop Card 3 - Banana */}
      <CropCard
        cropName={isTa ? 'வாழை (Banana)' : 'Banana'}
        matchRate="82% Match"
        yieldText={isTa ? '20 - 25 டன் / ஏக்கர்' : '20 - 25 Tons / Acre'}
        weatherText={isTa ? 'மிதமான வெப்ப மண்டலம்' : 'Sub-tropical Climate'}
        waterText={isTa ? '7,500 லிட்டர் / ஏக்கர்' : '7,500 Liters / Acre'}
        fertText={isTa ? 'மட்கிய கரிம உரம் & NPK கலவை' : 'Compost & NPK Complex'}
        isPrimary={false}
      />
    </div>
  );
};

export default CropAdvisory;
