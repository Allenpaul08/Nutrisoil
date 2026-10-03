import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSensorData, getCropRecommendations, getFertilizerAdvice } from '../services/api';

const HardwareContext = createContext();

export const HardwareProvider = ({ children }) => {
  const [isLiveHardware, setIsLiveHardware] = useState(true);
  const [sensorState, setSensorState] = useState({
    moisture: 0.0,
    temperature: 0.0,
    ph: 7.0,
    nitrogen: 0.0,
    phosphorus: 0.0,
    phosphorous: 0.0,
    potassium: 0.0,
    ec: 0.0,
    score: '10.0',
    status: 'CRITICAL'
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

  // Calculate Soil Health Score & Dynamic AI Recommendation
  const computeHealthMetrics = (vals) => {
    const moisture = vals.moisture !== undefined ? parseFloat(vals.moisture) : 0;
    const ph = vals.ph !== undefined ? parseFloat(vals.ph) : 7.0;
    const nitrogen = vals.nitrogen !== undefined ? parseFloat(vals.nitrogen) : 0;

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

    return { score: computedScore, status: statusVal, suggestionText };
  };

  // Poll live Raspberry Pi sensor data periodically
  useEffect(() => {
    let isMounted = true;

    const pollLiveSensor = async () => {
      try {
        const res = await fetchSensorData();
        if (!isMounted) return;

        if (res && res.success && res.data) {
          const liveData = res.data;
          setSensorState((prev) => {
            const n = liveData.nitrogen !== undefined ? parseFloat(liveData.nitrogen) : prev.nitrogen;
            const p = liveData.phosphorus !== undefined ? parseFloat(liveData.phosphorus) : (liveData.phosphorous !== undefined ? parseFloat(liveData.phosphorous) : prev.phosphorous);
            const k = liveData.potassium !== undefined ? parseFloat(liveData.potassium) : prev.potassium;
            const phVal = liveData.ph !== undefined ? parseFloat(liveData.ph) : prev.ph;
            const ecVal = liveData.ec !== undefined ? parseFloat(liveData.ec) : prev.ec;
            const moistVal = liveData.moisture !== undefined ? parseFloat(liveData.moisture) : prev.moisture;
            const tempVal = liveData.temperature !== undefined ? parseFloat(liveData.temperature) : prev.temperature;

            const metrics = computeHealthMetrics({ moisture: moistVal, ph: phVal, nitrogen: n });
            setAiSuggestion(metrics.suggestionText);

            return {
              ...prev,
              nitrogen: n,
              phosphorus: p,
              phosphorous: p,
              potassium: k,
              ph: phVal,
              ec: ecVal,
              moisture: moistVal,
              temperature: tempVal,
              score: metrics.score,
              status: metrics.status
            };
          });
        }
      } catch (err) {
        console.warn('[HardwareContext] Error polling live Raspberry Pi sensor data:', err);
      }
    };

    pollLiveSensor();
    const intervalId = setInterval(pollLiveSensor, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

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
          const cropData = cropRes?.data?.data || cropRes?.data || {};
          const fertData = fertRes?.data?.data || fertRes?.data || {};

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
    sensorState.phosphorus,
    sensorState.potassium,
    sensorState.ec
  ]);

  // Manual update handler
  const updateSensors = (newValues) => {
    setSensorState((prev) => {
      const moisture = newValues.moisture !== undefined ? parseFloat(newValues.moisture) : prev.moisture;
      const ph = newValues.ph !== undefined ? parseFloat(newValues.ph) : prev.ph;
      const nitrogen = newValues.nitrogen !== undefined ? parseFloat(newValues.nitrogen) : prev.nitrogen;
      const phosphorous = newValues.phosphorous !== undefined ? parseFloat(newValues.phosphorous) : (newValues.phosphorus !== undefined ? parseFloat(newValues.phosphorus) : prev.phosphorous);
      const potassium = newValues.potassium !== undefined ? parseFloat(newValues.potassium) : prev.potassium;
      const ec = newValues.ec !== undefined ? parseFloat(newValues.ec) : prev.ec;
      const temperature = newValues.temperature !== undefined ? parseFloat(newValues.temperature) : prev.temperature;

      const metrics = computeHealthMetrics({ moisture, ph, nitrogen });
      setAiSuggestion(metrics.suggestionText);

      return {
        ...prev,
        moisture,
        ph,
        nitrogen,
        phosphorus: phosphorous,
        phosphorous: phosphorous,
        potassium,
        ec,
        temperature,
        score: metrics.score,
        status: metrics.status
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
