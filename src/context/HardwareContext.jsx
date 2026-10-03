import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCropRecommendations, getFertilizerAdvice } from '../services/api';

const HardwareContext = createContext();

export const HardwareProvider = ({ children }) => {
  const [isLiveHardware, setIsLiveHardware] = useState(false);
  const [sensorState, setSensorState] = useState({
    moisture: 52.0,
    temperature: 28.5,
    ph: 6.8,
    nitrogen: 135.0,
    phosphorous: 45.0,
    potassium: 120.0,
    ec: 1.35,
    score: '84.5',
    status: 'OPTIMAL'
  });

  const [aiSummary, setAiSummary] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [selectedSoilType, setSelectedSoilType] = useState('');
  const [soilAnalysisResult, setSoilAnalysisResult] = useState(null);
  const [mlResult, setMlResult] = useState({
    crop: null,
    cropConfidence: null,
    fertilizer: null,
    fertilizerConfidence: null,
    fertilizerPath: null
  });
  const [chatHistory, setChatHistory] = useState([]);

  // Fetch Crop & Fertilizer ML recommendations when sensorState changes
  useEffect(() => {
    let isMounted = true;

    const fetchMlRecommendations = async () => {
      try {
        const [cropRes, fertRes] = await Promise.all([
          getCropRecommendations(sensorState),
          getFertilizerAdvice(sensorState)
        ]);

        if (!isMounted) return;

        if ((cropRes && cropRes.success) || (fertRes && fertRes.success)) {
          const cropData = cropRes?.data || {};
          const fertData = fertRes?.data || {};

          setMlResult((prev) => ({
            crop: cropData.crop || cropData.recommended_crop || cropData.prediction || prev.crop,
            cropConfidence: (cropData.cropConfidence !== undefined && cropData.cropConfidence !== null)
              ? cropData.cropConfidence
              : ((cropData.confidence !== undefined && cropData.confidence !== null) ? cropData.confidence : (cropData.probability ?? prev.cropConfidence)),
            fertilizer: fertData.fertilizer || fertData.recommended_fertilizer || fertData.prediction || prev.fertilizer,
            fertilizerConfidence: (fertData.fertilizerConfidence !== undefined && fertData.fertilizerConfidence !== null)
              ? fertData.fertilizerConfidence
              : ((fertData.confidence !== undefined && fertData.confidence !== null) ? fertData.confidence : (fertData.probability ?? prev.fertilizerConfidence)),
            fertilizerPath: fertData.fertilizerPath || fertData.path || fertData.recommendation_path || fertData.recommendation_mode || prev.fertilizerPath
          }));
        }
      } catch (error) {
        console.error('[HardwareContext] ML recommendation fetch error:', error);
      }
    };

    fetchMlRecommendations();

    return () => {
      isMounted = false;
    };
  }, [
    sensorState.moisture,
    sensorState.temperature,
    sensorState.ph,
    sensorState.nitrogen,
    sensorState.phosphorous,
    sensorState.potassium,
    sensorState.ec
  ]);

  // Calculate Soil Health Score & Dynamic AI Recommendation
  const updateSensors = (newValues) => {
    if (isLiveHardware) return;

    setSensorState((prev) => {
      const moisture = newValues.moisture !== undefined ? parseFloat(newValues.moisture) : prev.moisture;
      const ph = newValues.ph !== undefined ? parseFloat(newValues.ph) : prev.ph;
      const nitrogen = newValues.nitrogen !== undefined ? parseFloat(newValues.nitrogen) : prev.nitrogen;
      const phosphorous = newValues.phosphorous !== undefined ? parseFloat(newValues.phosphorous) : prev.phosphorous;
      const potassium = newValues.potassium !== undefined ? parseFloat(newValues.potassium) : prev.potassium;
      const ec = newValues.ec !== undefined ? parseFloat(newValues.ec) : prev.ec;
      const temperature = newValues.temperature !== undefined ? parseFloat(newValues.temperature) : prev.temperature;

      let scoreVal = 100.0;
      if (ph < 6.0) scoreVal -= (6.0 - ph) * 15.0;
      if (ph > 7.5) scoreVal -= (ph - 7.5) * 15.0;
      if (moisture < 40) scoreVal -= (40 - moisture) * 0.8;
      if (nitrogen < 120) scoreVal -= (120 - nitrogen) * 0.2;

      const computedScoreNum = Math.max(10, Math.min(99, scoreVal));
      const computedScore = computedScoreNum.toFixed(1);
      
      let statusVal = 'OPTIMAL';
      let suggestionText = '';

      if (computedScoreNum >= 80) {
        statusVal = 'OPTIMAL';
        suggestionText = 'Excellent Soil Condition! Soil nutrient levels are ideal. Maintain organic fertilization schedule and precision drip irrigation.';
      } else if (computedScoreNum >= 60) {
        statusVal = 'FAIR';
        suggestionText = 'Fair Soil Condition. Soil moisture or Nitrogen is slightly lower than target. Apply split dose Urea (25kg/acre) and increase drip frequency.';
      } else {
        statusVal = 'CRITICAL';
        suggestionText = 'Critical Soil Warning! Soil pH or nutrient level requires immediate intervention. Apply soil lime/gypsum conditioner and organic compost immediately.';
      }

      setAiSuggestion(suggestionText);

      return {
        ...prev,
        moisture,
        ph,
        nitrogen,
        phosphorous,
        potassium,
        ec,
        temperature,
        score: computedScore,
        status: statusVal
      };
    });
  };

  const toggleHardwareMode = (isLive) => {
    setIsLiveHardware(isLive);
  };

  return (
    <HardwareContext.Provider
      value={{
        isLiveHardware,
        toggleHardwareMode,
        sensorState,
        updateSensors,
        aiSummary,
        setAiSummary,
        aiSuggestion,
        setAiSuggestion,
        selectedSoilType,
        setSelectedSoilType,
        soilAnalysisResult,
        setSoilAnalysisResult,
        mlResult,
        setMlResult,
        chatHistory,
        setChatHistory
      }}
    >
      {children}
    </HardwareContext.Provider>
  );
};

export const useHardware = () => useContext(HardwareContext);
