import { useHardware } from '../context/HardwareContext';
import { useLanguage } from '../context/LanguageContext';

export const useAIRecommendations = () => {
  const {
    sensorState,
    aiSummary,
    setAiSummary,
    aiSuggestion,
    setAiSuggestion,
    selectedSoilType,
    setSelectedSoilType,
    soilAnalysisResult,
    setSoilAnalysisResult
  } = useHardware();

  const { isTa } = useLanguage();

  const generateAIRecommendation = (score) => {
    const numericScore = parseFloat(score);
    if (numericScore >= 80) {
      return {
        level: 'OPTIMAL',
        title: isTa ? 'சிறந்த மண் நிலை' : 'Excellent Soil Condition',
        suggestion: isTa
          ? 'மண் சத்துக்கள் சீராக உள்ளன. சொட்டுநீர் பாசனத்தை தொடரவும்.'
          : 'Soil nutrient levels are ideal. Maintain organic fertilization schedule and precision drip irrigation.'
      };
    } else if (numericScore >= 60) {
      return {
        level: 'FAIR',
        title: isTa ? 'மிதமான மண் நிலை' : 'Fair Soil Condition',
        suggestion: isTa
          ? 'நைட்ரஜன் சத்து சற்று குறைவாக உள்ளது. யூரியா (25கி/ஏக்கர்) இடவும்.'
          : 'Soil moisture or Nitrogen is slightly lower than target. Apply split dose Urea (25kg/acre) and increase drip frequency.'
      };
    } else {
      return {
        level: 'CRITICAL',
        title: isTa ? 'கவனத்திற்கு உரிய நிலை' : 'Critical Soil Warning',
        suggestion: isTa
          ? 'மண் pH மாற்றப்பட வேண்டும். உடனடியாக இயற்கை உரம் சேர்க்கவும்.'
          : 'Soil pH or nutrient level requires immediate intervention. Apply soil lime/gypsum conditioner and organic compost immediately.'
      };
    }
  };

  return {
    sensorState,
    aiSummary,
    setAiSummary,
    aiSuggestion,
    setAiSuggestion,
    selectedSoilType,
    setSelectedSoilType,
    soilAnalysisResult,
    setSoilAnalysisResult,
    generateAIRecommendation
  };
};
