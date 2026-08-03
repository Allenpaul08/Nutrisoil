import axios from 'axios';

// Base Axios instance configured for Flask Backend & ESP32 Live Gateway
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Response interceptor for centralized error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.warn(`[Axios API Warning] ${error.config?.url} unreachable:`, error.message);
    return Promise.reject(error);
  }
);

// 1. GET /sensor-data (ESP32 Live Sensor Stream)
export const fetchSensorData = async () => {
  try {
    const data = await apiClient.get('/sensor-data');
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: 'Backend/ESP32 offline',
      data: null
    };
  }
};

// 2. POST /soil-analysis (AI Soil Diagnostic Evaluation)
export const analyzeSoilAI = async (sensorState) => {
  try {
    const data = await apiClient.post('/soil-analysis', sensorState);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: 'Using local AI analysis engine fallback',
      data: {
        score: sensorState.score,
        status: sensorState.status,
        summary: `Soil status is ${sensorState.status} with health score ${sensorState.score}.`
      }
    };
  }
};

// 3. POST /chatbot (Gemini AI API Chat Endpoint)
export const sendChatMessage = async (message, currentLang, sensorState) => {
  try {
    const data = await apiClient.post('/chatbot', {
      message,
      language: currentLang,
      sensorState
    });
    return data;
  } catch (error) {
    return null;
  }
};

// 4. POST /crop-recommendation (Agronomic Crop Advisory)
export const getCropRecommendations = async (sensorState) => {
  try {
    const data = await apiClient.post('/crop-recommendation', sensorState);
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null };
  }
};

// 5. POST /fertilizer (NPK Recipe & Fertilizer Advisory)
export const getFertilizerAdvice = async (sensorState) => {
  try {
    const data = await apiClient.post('/fertilizer', sensorState);
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null };
  }
};

// 6. POST /history (Scan Timeline Database)
export const getScanHistory = async () => {
  try {
    const data = await apiClient.post('/history', {});
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null };
  }
};

// 7. POST /soil-detection (Soil Color Detection)
export const detectSoilType = async (color, currentLang) => {
  try {
    const data = await apiClient.post('/soil-detection', { color, language: currentLang });
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null };
  }
};

export const detectSoilTypeAPI = detectSoilType;

export default apiClient;
