/**
 * NutriSoil RAG Knowledge Base
 * 
 * This document is injected as system context into every Groq API call,
 * enabling the chatbot to answer questions about the entire app (RAG-style).
 */

export const NUTRISOIL_KNOWLEDGE_BASE = `
=== NUTRISOIL APP — COMPLETE KNOWLEDGE BASE ===

## ABOUT NUTRISOIL
NutriSoil is an AI-powered Intelligent Soil Nutrient Management System designed for Tamil Nadu farmers (primarily Thanjavur region). It helps farmers monitor soil health, get crop recommendations, manage fertilizers, and track carbon footprint. The app supports both Tamil and English languages.

The demo farm profile is:
- Farm Name: Green Agri Valley (கிரீன் அக்ரி வேலி)
- Location: Thanjavur, Tamil Nadu
- Acreage: 4.5 Acres
- Primary Crop: Paddy (Samba variety)

---

## SENSOR PARAMETERS (ESP32-NPK-01 Sensor)

### Soil Moisture
- Range: 0–100%
- Optimal: 40–70%
- Current demo value: ~52%
- Low moisture (<40%) → risk of crop stress; recommend drip irrigation
- High moisture (>80%) → risk of root rot; reduce irrigation

### Soil pH
- Range: 0–14
- Optimal for most crops: 6.0–7.5
- Demo value: 6.8 (slightly acidic, ideal for Paddy)
- Low pH (<6.0) → acidic soil → apply lime to raise pH
- High pH (>7.5) → alkaline soil → apply gypsum/sulfur to lower pH
- pH strongly affects nutrient availability

### Electrical Conductivity (EC)
- Unit: dS/m (decisiemens per meter)
- Optimal: 0.8–2.0 dS/m
- Demo value: 1.35 dS/m (normal range)
- High EC (>3.0) → salt stress → flush soil with water
- Low EC (<0.5) → nutrient deficiency → apply balanced fertilizer

### Nitrogen (N)
- Unit: mg/kg
- Optimal: 120–180 mg/kg
- Demo value: 135 mg/kg (adequate)
- Low Nitrogen → yellowing leaves, stunted growth → apply Urea or DAP
- Nitrogen is the most critical macronutrient for plant growth

### Temperature
- Unit: °C
- Demo value: 28.5°C
- Optimal range for Paddy: 20–35°C
- High temperature (>38°C) → heat stress → apply mulching, increase irrigation

### Soil Health Score
- Range: 10–99
- Calculated from pH, moisture, nitrogen levels combined
- Score ≥ 80: OPTIMAL — excellent condition
- Score 60–79: FAIR — minor issues, improve specific parameters
- Score < 60: CRITICAL — immediate intervention needed
- Demo score: 84.5 (OPTIMAL status)

---

## APP PAGES / SCREENS

### 1. Home Screen
- The main dashboard / landing page
- Shows a welcome hero banner with farm name and location
- Displays the Soil Health Score as an animated circular gauge
- Shows current mode: Prototype Mode (simulated values) or Live ESP32 Mode (real sensor data)
- Has a gold pulsing "AI Active" badge
- Quick Action Grid (3×3 cards): Soil Scan, AI Analysis, Crop Advisory, Fertilizer Advisory, Micronutrients, Irrigation, Carbon Footprint, History, Analytics
- Each Quick Action card navigates to its respective page

### 2. Soil Scan Screen (/scan)
- Shows 4 sensor cards: Soil Moisture, Soil pH, EC Level, Nitrogen (N)
- In Prototype Mode: sliders to adjust sensor values (Moisture, pH, Nitrogen)
- The soil health score recalculates live as sliders change
- "Run AI Diagnostic Analysis" button triggers AI analysis on current values
- Shows simulated real-time sensor data

### 3. AI Analysis Screen (/ai)
- Shows AI-computed soil health gauge
- Displays an "AI Agronomic Summary" card with text analysis
- Shows Risk Level and Model Confidence
- Soil Type Detection section: dropdown to select soil color (Red, Black, Sandy, Clay, Loamy)
- Analyze Soil button gives soil-type specific recommendations

### 4. Crop Advisory Screen (/crop)
- AI-powered crop recommendation based on current soil values
- Shows recommended crops for the current soil conditions
- For Thanjavur region with current demo values: Paddy (Samba), Banana, Sugarcane
- Provides sowing season guidance and expected yield
- Crop compatibility matrix based on pH, moisture, nitrogen

### 5. Fertilizer Advisory Screen (/fertilizer)
- Shows targeted fertilizer recipe for current soil
- Recommended for demo: Urea (46% N) + Organic Neem Cake
- Dosage: 25 kg/Acre
- NPK Status display (Nitrogen, Phosphorus, Potassium levels)
- Application schedule: split into 2 doses (at sowing + 30 days after germination)
- Organic options: compost, vermicompost, green manure

### 6. Micronutrients Screen (/micronutrients)
- Trace element overview: Zinc (Zn), Iron (Fe), Manganese (Mn), Copper (Cu), Boron (B), Molybdenum (Mo)
- Shows deficiency status for each micronutrient
- Demo: all micronutrients within healthy agronomic bounds
- Provides supplement recommendations if deficiencies detected

### 7. Irrigation Screen (/irrigation)
- Smart Precision Drip Schedule
- Shows optimal irrigation volume: 6,500 liters/acre
- Water savings: 42% compared to flood irrigation
- Next irrigation window: Tomorrow 06:00 AM
- Drip vs flood irrigation comparison
- Schedule based on soil moisture readings and crop water requirements

### 8. Carbon Footprint Screen (/carbon)
- Tracks CO₂ equivalent emissions from farm operations
- Current: 120.0 kg CO₂e/Acre (Low Impact — Eco-Friendly)
- Eco Reduction Roadmap with actionable tips:
  - Switch to precision drip irrigation to cut diesel pump emissions
  - Adopt Neem-coated Urea to prevent N₂O greenhouse gas release
- Sustainability rating and comparison benchmarks

### 9. History Screen (/history)
- Offline Scan History — stores past soil scan results
- Shows scan records with timestamp, crop, score and status
- Demo entry: Paddy (Samba) - Scan #104, Score: 84.5, Optimal

### 10. Analytics Screen (/analytics)
- Soil Health Trend chart over 5 weeks
- Interactive line chart built with Recharts library
- Shows historical soil health score progression
- Identifies trends: improving, stable, or declining soil health

### 11. Profile Screen (/profile)
- Farm details: name, location, acreage, primary crop
- Farmer profile information
- Device connection status

### 12. Settings Screen (/settings)
- Hardware Connection Settings: toggle to switch between Prototype Mode and Live ESP32 BLE Mode
- AI Configuration: field to enter Groq API key for NutriBot AI chatbot
- BLE device: ESP32-NPK-01

---

## NUTRIBOT AI CHATBOT
NutriBot is the AI chatbot floating button (🤖) visible on all screens.
It uses the Groq API (llama3-8b-8192 model) to answer questions about:
- The NutriSoil app features and navigation
- Soil health and nutrient management
- Crop recommendations and farming advice
- Fertilizer types and application
- Irrigation scheduling
- Disease detection guidance
- Carbon footprint and sustainability
- Tamil Nadu agriculture and local crops

To use the chatbot, the user must enter their Groq API key in Settings → AI Configuration.

---

## AGRONOMIC KNOWLEDGE

### Common Crops (Tamil Nadu / Thanjavur)
- **Paddy (Rice)**: Requires pH 5.5–7.0, moisture 60–80%, nitrogen-heavy fertilization
- **Banana**: Requires pH 6.0–7.5, high moisture, potassium-rich soil
- **Sugarcane**: Requires pH 6.0–8.0, moderate moisture, phosphorus-rich
- **Cotton**: Requires pH 5.8–7.0, moderate moisture
- **Groundnut**: Requires pH 5.9–7.0, well-drained soil

### Fertilizer Types
- **Urea (46% N)**: High nitrogen source; apply in split doses; neem-coated reduces volatilization
- **DAP (Di-Ammonium Phosphate)**: 18% N + 46% P₂O₅; good at sowing time
- **MOP (Muriate of Potash)**: 60% K₂O; potassium source
- **Organic Compost**: Improves soil structure, adds micronutrients
- **Vermicompost**: Best organic amendment; improves water retention
- **Neem Cake**: Natural pesticide + slow-release nitrogen

### Soil Types
- **Red Soil**: Low water retention, low organic matter, needs irrigation + compost
- **Black Soil (Regur)**: High clay content, excellent water retention, good for cotton
- **Sandy Soil**: High drainage, low nutrients, needs frequent irrigation + fertilizer
- **Clay Soil**: High water retention, poor drainage, prone to waterlogging
- **Loamy Soil**: Ideal soil — balanced sand, silt, clay; best for most crops

### Disease Management
- Upload leaf images via the Scan screen for AI disease detection
- Common Paddy diseases: Blast, Bacterial Blight, Brown Spot, Sheath Blight
- Treatment depends on disease type; contact local agriculture department for pesticide advice

### Irrigation Best Practices
- Drip irrigation saves 40–60% water vs flood irrigation
- Irrigate early morning (5–7 AM) to minimize evaporation
- Monitor soil moisture before every irrigation cycle
- Avoid over-irrigation: causes nutrient leaching and root diseases

---

## HOW TO USE NUTRISOIL
1. Open the app → Home screen shows your soil health score
2. Go to Soil Scan → adjust prototype sliders to simulate/set sensor values
3. Tap "Run AI Analysis" → get AI-generated soil health report
4. Check Crop Advisory for crop recommendations
5. Check Fertilizer Advisory for fertilizer recipe
6. Monitor Irrigation schedule for optimal watering
7. Track Carbon Footprint for eco-friendly farming
8. Use NutriBot (🤖 button) to ask any farming or app question
9. In Settings, enable Live ESP32 to connect real hardware sensor

---
END OF NUTRISOIL KNOWLEDGE BASE
`;

export default NUTRISOIL_KNOWLEDGE_BASE;
