import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { detectSoilType } from '../services/api';

const SoilTypeCard = () => {
  const { dict, isTa } = useLanguage();
  const { selectedSoilType, setSelectedSoilType, soilAnalysisResult, setSoilAnalysisResult } = useHardware();

  const handleAnalyze = async () => {
    if (!selectedSoilType) return;

    // Backend API Call Placeholder
    const apiRes = await detectSoilType(selectedSoilType, isTa ? 'ta' : 'en');
    if (apiRes && apiRes.result) {
      setSoilAnalysisResult(apiRes.result);
      return;
    }

    let resultHtml = '';
    if (isTa) {
      switch (selectedSoilType) {
        case 'red':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 செம்மண் (Red Soil)</div>
            <p style="margin-bottom:8px;"><b>பண்புகள் (Characteristics):</b><br>• இரும்புச் சத்து அதிகம்<br>• நல்ல நீர் வடிகால் வசதி</p>
            <p style="margin-bottom:8px;"><b>ஏற்ற பயிர்கள் (Suitable Crops):</b><br>🌾 நிலக்கடலை<br>🌾 சிறுதானியங்கள்<br>🌾 பருத்தி</p>
            <p><b>பரிந்துரை (Recommendation):</b><br>இயற்கை உரம் மற்றும் மட்கிய தொழு உரம் சேர்க்கவும்.</p>
          `;
          break;
        case 'black':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 கரிமண் (Black Soil)</div>
            <p style="margin-bottom:8px;"><b>பண்புகள் (Characteristics):</b><br>• அதிக நீர் தாங்கும் திறன்<br>• பொட்டாசியம் மற்றும் களிமண் சத்து அதிகம்</p>
            <p style="margin-bottom:8px;"><b>ஏற்ற பயிர்கள் (Suitable Crops):</b><br>🌾 பருத்தி<br>🌾 சோயாபீன்<br>🌾 சூரியகாந்தி</p>
            <p><b>பரிந்துரை (Recommendation):</b><br>நீர் தேங்குவதை தவிர்க்க வடிகால் வசதி செய்யவும்.</p>
          `;
          break;
        case 'sandy':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 மணல் மண் (Sandy Soil)</div>
            <p style="margin-bottom:8px;"><b>பண்புகள் (Characteristics):</b><br>• நீர் விரைவாக வடிகிறது<br>• காற்றோட்டம் அதிகம்</p>
            <p style="margin-bottom:8px;"><b>ஏற்ற பயிர்கள் (Suitable Crops):</b><br>🌾 தர்பூசணி<br>🌾 நிலக்கடலை<br>🌾 முந்திரி</p>
            <p><b>பரிந்துரை (Recommendation):</b><br>கரிமப் பொருட்களை அதிகளவில் சேர்க்கவும்.</p>
          `;
          break;
        case 'clay':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 களிமண் (Clay Soil)</div>
            <p style="margin-bottom:8px;"><b>பண்புகள் (Characteristics):</b><br>• அதிக நீர் தாங்கு திறன்<br>• ஊட்டச்சத்துக்களை பிடித்து வைக்கும் திறன்</p>
            <p style="margin-bottom:8px;"><b>ஏற்ற பயிர்கள் (Suitable Crops):</b><br>🌾 நெல்<br>🌾 ப்ரோக்கோலி<br>🌾 கோதுமை</p>
            <p><b>பரிந்துரை (Recommendation):</b><br>ஆழ உழவு செய்து மண் காற்றோட்டத்தை அதிகரிக்கவும்.</p>
          `;
          break;
        case 'loamy':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 கலப்பு மண் (Loamy Soil)</div>
            <p style="margin-bottom:8px;"><b>பண்புகள் (Characteristics):</b><br>• சமநிலையான நீர் மற்றும் காற்றோட்டம்<br>• அதிக வளமானது</p>
            <p style="margin-bottom:8px;"><b>ஏற்ற பயிர்கள் (Suitable Crops):</b><br>🌾 பெரும்பாலான காய்கறிகள் மற்றும் பழங்கள்</p>
            <p><b>பரிந்துரை (Recommendation):</b><br>விவசாயத்திற்கு மிகவும் ஏற்ற மண் வகை.</p>
          `;
          break;
        default:
          resultHtml = '<p>மண்ணின் நிறத்தைத் தேர்ந்தெடுக்கவும்.</p>';
      }
    } else {
      switch (selectedSoilType) {
        case 'red':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 Red Soil</div>
            <p style="margin-bottom:8px;"><b>Characteristics:</b><br>• Rich in Iron & Manganese oxides<br>• Excellent drainage</p>
            <p style="margin-bottom:8px;"><b>Suitable Crops:</b><br>🌾 Groundnut<br>🌾 Millets<br>🌾 Cotton</p>
            <p><b>Recommendation:</b><br>Add organic manure and farmyard compost to improve moisture holding.</p>
          `;
          break;
        case 'black':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 Black Soil</div>
            <p style="margin-bottom:8px;"><b>Characteristics:</b><br>• High moisture retention<br>• Rich in calcium, carbonate, & potash</p>
            <p style="margin-bottom:8px;"><b>Suitable Crops:</b><br>🌾 Cotton<br>🌾 Soybean<br>🌾 Sunflower</p>
            <p><b>Recommendation:</b><br>Avoid waterlogging by ensuring proper field drainage channels.</p>
          `;
          break;
        case 'sandy':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 Sandy Soil</div>
            <p style="margin-bottom:8px;"><b>Characteristics:</b><br>• High permeability & rapid drainage<br>• Well aerated</p>
            <p style="margin-bottom:8px;"><b>Suitable Crops:</b><br>🌾 Watermelon<br>🌾 Groundnut<br>🌾 Cashew</p>
            <p><b>Recommendation:</b><br>Incorporate organic compost to enhance water & nutrient retention.</p>
          `;
          break;
        case 'clay':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 Clay Soil</div>
            <p style="margin-bottom:8px;"><b>Characteristics:</b><br>• High water holding capacity<br>• Dense particle structure</p>
            <p style="margin-bottom:8px;"><b>Suitable Crops:</b><br>🌾 Paddy (Rice)<br>🌾 Broccoli<br>🌾 Wheat</p>
            <p><b>Recommendation:</b><br>Improve drainage channels and loosen compact soil layers.</p>
          `;
          break;
        case 'loamy':
          resultHtml = `
            <div style="font-size:16px; font-weight:700; color:#2E7D32; margin-bottom:8px;">🌱 Loamy Soil</div>
            <p style="margin-bottom:8px;"><b>Characteristics:</b><br>• Optimal balance of sand, silt, and clay<br>• High inherent fertility</p>
            <p style="margin-bottom:8px;"><b>Suitable Crops:</b><br>🌾 Most vegetables, fruits, and cash crops</p>
            <p><b>Recommendation:</b><br>Ideal soil type for sustainable multi-crop farming.</p>
          `;
          break;
        default:
          resultHtml = '<p>Please select a soil color.</p>';
      }
    }

    setSoilAnalysisResult(resultHtml);
  };

  return (
    <div className="soil-type-card">
      <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '12px' }}>
        {dict.soilTitle}
      </h2>

      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
        {dict.soilLabel}
      </label>

      <select
        value={selectedSoilType}
        onChange={(e) => setSelectedSoilType(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          background: '#F9FAFB',
          fontSize: '14px',
          marginBottom: '12px'
        }}
      >
        <option value="">{dict.soilSelect}</option>
        <option value="red">{dict.soilRed}</option>
        <option value="black">{dict.soilBlack}</option>
        <option value="sandy">{dict.soilSandy}</option>
        <option value="clay">{dict.soilClay}</option>
        <option value="loamy">{dict.soilLoamy}</option>
      </select>

      <button className="btn-primary" onClick={handleAnalyze}>
        {dict.soilBtn}
      </button>

      {soilAnalysisResult && (
        <div
          id="soilResult"
          style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '12px',
            background: '#F3F9F3',
            border: '1px solid #C8E6C9'
          }}
          dangerouslySetInnerHTML={{ __html: soilAnalysisResult }}
        />
      )}
    </div>
  );
};

export default SoilTypeCard;
