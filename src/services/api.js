import axios from 'axios';

// Base Axios instance configured for Flask Backend & ESP32 Live Gateway
const API_BASE_URL = 'http://10.156.163.207:5000/api';

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

// 1. GET /sensor/latest (Raspberry Pi ESP32 Live Sensor Stream)
export const fetchSensorData = async () => {
  try {
    const data = await apiClient.get('/sensor/latest');

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.warn('Failed to fetch live sensor data:', error.message);

    return {
      success: false,
      error: 'Raspberry Pi sensor backend offline',
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

// 4. POST /ml/crop (Agronomic Crop Advisory)
export const getCropRecommendations = async (sensorState) => {
  try {
    const data = await apiClient.post('/ml/crop', sensorState);
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null };
  }
};

// 5. POST /ml/fertilizer (NPK Recipe & Fertilizer Advisory)
export const getFertilizerAdvice = async (sensorState) => {
  try {
    const payload = { crop: sensorState?.crop || '', ...sensorState };
    const data = await apiClient.post('/ml/fertilizer', payload);
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null };
  }
};

// 6. GET /sensor/history (Scan Timeline Database)
export const getScanHistory = async () => {
  try {
    const data = await apiClient.get('/sensor/history');
    return { success: true, data: data?.data || data };
  } catch (error) {
    return { success: false, data: [] };
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
