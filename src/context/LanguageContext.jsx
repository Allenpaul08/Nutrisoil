import React, { createContext, useContext, useState } from 'react';

const i18n = {
  ta: {
    appTitle: 'நியூட்ரிசாயில்',
    langText: 'English',

    // Bottom Nav
    navHome: 'முகப்பு',
    navScan: 'ஸ்கேன்',
    navAi: 'AI',
    navHist: 'வரலாறு',
    navProfile: 'சுயவிவரம்',

    // Home Screen
    welcomeText: 'வரவேற்கிறோம், செல்வம்பண்ணை',
    aiActiveText: 'AI Active',
    farmInfoText: 'தஞ்சாவூர் • நெல் (Samba)',
    offlineChip: 'ஆஃப்லைன் பயன்முறை',
    modeSim: 'மாதிரி பயன்முறை',
    modeLive: 'நேரலை ESP32',
    gaugeTitle: 'மண் சுகாதார மதிப்பெண்',
    quickTitle: 'விரைவு செயல்பாடுகள்',
    actScan: 'மண் பரிசோதனை',
    actAi: 'AI பகுப்பாய்வு',
    actCrop: 'பயிர் ஆலோசனை',
    actFert: 'உர ஆலோசனை',
    actMicro: 'நுண்ணூட்டச்சத்து',
    actIrri: 'நீர்ப்பாசனம்',
    actCarbon: 'கார்ப்பன் தடம்',
    actHist: 'வரலாறு',
    actAnalytics: 'வரைபடம்',

    // Soil Scan Screen
    pTitleMoist: 'மண் ஈரம்',
    pTitlePh: 'மண் pH',
    pTitleEc: 'மின் கடத்துத்திறன் (EC)',
    pTitleN: 'நைட்ரஜன் (N)',
    pTitleP: 'பாஸ்பரஸ் (P)',
    pTitleK: 'பொட்டாசியம் (K)',
    pTitleTemp: 'மண் வெப்பநிலை',
    simTitle: 'மாதிரி சென்சார் கட்டுப்பாடுகள்',
    sldTitleMoist: 'மண் ஈரம் (%)',
    sldTitlePh: 'மண் pH',
    sldTitleN: 'நைட்ரஜன் (N)',
    sldTitleP: 'பாஸ்பரஸ் (P)',
    sldTitleK: 'பொட்டாசியம் (K)',
    sldTitleTemp: 'மண் வெப்பநிலை (°C)',
    btnRunAi: '🤖 AI பகுப்பாய்வு செய்',

    // AI Screen
    aiGaugeTitle: 'AI மண் மதிப்பீடு',
    aiSummaryHeader: 'AI விவசாய சுருக்கம்',
    aiSummaryText: 'மண் ஊட்டச்சத்து நிலைகள் சீராகவும் அதிக வளமுடனும் உள்ளன. நெல் சாகுபடிக்கு உகந்தது.',
    lblRisk: 'ஆபத்து நிலை',
    aiRisk: 'குறைந்த ஆபத்து',
    lblConf: 'மாதிரி நம்பிக்கை',
    soilTitle: '🌱 மண் வகை கண்டறிதல்',
    soilLabel: 'மண் நிறம்',
    soilBtn: 'மண்ணை பகுப்பாய்வு செய்',
    soilSelect: 'தேர்வு செய்யவும்',
    soilRed: 'செம்மண்',
    soilBlack: 'கரிமண்',
    soilSandy: 'மணல் மண்',
    soilClay: 'களிமண்',
    soilLoamy: 'கலப்பு மண்',

    // Fert Screen
    fertRecipeHeader: 'பரிந்துரைக்கப்படும் உரக் கலவை',
    fertName: 'யூரியா (46% N) மற்றும் வேப்பங் பிண்ணாக்கு',
    fertQty: 'அளவு: 25 கிலோ / ஏக்கர்',
    fertNpkHeader: 'NPK நிலை',
    fertNpkText: 'நைட்ரஜன் அளவு போதுமானதாக உள்ளது. அடிப்படை உரத்தை தொடரவும்.',
    fertTimingHeader: 'இடும் நேரம்',
    fertTimingText: '2 தவணைகளாக இடவும்: விதைப்பின் போதும் 30 நாட்கள் கழித்தும்.',

    // Micro Screen
    microHeader: 'நுண்ணூட்டச்சத்து கண்ணோட்டம்',
    microOverall: 'அனைத்து நுண்ணூட்டச்சத்துக்களும் ஆரோக்கியமான அளவில் உள்ளன.',

    // Irri Screen
    irriTitle: 'சொட்டுநீர் பாசன திட்டம்',
    irriVolume: '6,500 லிட்டர் / ஏக்கர்',
    irriSavings: '42% தண்ணீர் சேமிப்பு',
    irriNextHeader: 'அடுத்த பாசன நேரம்',
    irriNextText: 'நாளை அதிகாலை (06:00 AM)',

    // Carbon Screen
    co2Val: '120.0 kg CO₂e / ஏக்கர்',
    sustainRating: 'மதிப்பீடு: குறைந்த கார்பன் உமிழ்வு',
    carbonRoadmapTitle: 'சுற்றுச்சூழல் வழிகாட்டி',
    carbonRoadmapText: '• சொட்டுநீர் பாசனம் பயன்படுத்தி பம்ப் உமிழ்வை குறைக்கவும்.\n\n• வேப்ப பூசப்பட்ட யூரியாவை பயன்படுத்தி பசுமை இல்ல வாயுவை தவிர்க்கவும்.',

    // History
    histTitle: 'ஆஃப்லைன் பரிசோதனை வரலாறு',
    histItemTitle: 'நெல் (Samba) - பரிசோதனை #104',
    histItemSub: 'மதிப்பெண்: 84.5 • சிறந்த நிலை',

    // Analytics
    chartTitle: 'மண் சுகாதார வரைபடம் (5 வாரங்கள்)',

    // Profile
    profFarmTitle: 'பண்ணை விவரங்கள்',
    profFarmDetails: '<strong>பண்ணை:</strong> கிரீன் அக்ரி வேலி<br><strong>இடம்:</strong> தஞ்சாவூர், தமிழ்நாடு<br><strong>பரப்பளவு:</strong> 4.5 ஏக்கர்<br><strong>பயிர்:</strong> நெல் (சம்பா)',

    // Settings
    settHwTitle: 'வன்பொருள் இணைப்பு அமைப்புகள்',
    settEnableLive: 'நேரலை ESP32 இணைப்பை இயக்கு',
    hwDescSim: 'தற்போது மாதிரி சிமுலேஷன் மதிப்புகள் பயன்படுத்தப்படுகின்றன',
    hwDescLive: 'BLE இணைக்கப்பட்டது (ESP32-NPK-01)',
    settAiTitle: '🤖 AI உரையாடல் அமைப்புகள்',
    settGroqLabel: 'Groq API விசை',
    settGroqPlaceholder: 'உங்கள் Groq API விசையை உள்ளிடவும்',
    settGroqSaved: '✓ API விசை சேமிக்கப்பட்டது',
    settGroqEmpty: 'API விசை இல்லை — NutriBot இயங்காது',
    settGroqHelp: 'இலவச API விசையை console.groq.com இல் பெறலாம்',

    // Notifications
    notifTitle: 'அறிவிப்புகள்',
    notifNew: 'புதியது',
    notifMarkRead: 'அனைத்தையும் படித்தது என குறி',
    notifEmpty: 'அறிவிப்புகள் இல்லை',
    notif1Title: 'மண் ஈரம் குறைவு',
    notif1Msg: 'ஈரம் 38% ஆக குறைந்தது — விரைவில் நீர்ப்பாசனம் செய்யுங்கள்.',
    notif1Time: '2 நிமிடம் முன்',
    notif2Title: 'நைட்ரஜன் நல்ல நிலையில்',
    notif2Msg: 'N அளவு 135 mg/kg — ஆரோக்கியமான அளவு.',
    notif2Time: '1 மணி முன்',
    notif3Title: 'மண் வெப்பநிலை எச்சரிக்கை',
    notif3Msg: 'வெப்பநிலை 28.5°C — நெல் வளர்ச்சிக்கு ஏற்றது.',
    notif3Time: '3 மணி முன்',
    notif4Title: 'பாஸ்பரஸ் சரிபார்ப்பு',
    notif4Msg: 'P அளவு 45 mg/kg — பாஸ்பேட் உரம் சேர்க்க பரிசீலிக்கவும்.',
    notif4Time: 'நேற்று'
  },
  en: {
    appTitle: 'NUTRISOIL',
    langText: 'தமிழ் (Tamil)',

    // Bottom Nav
    navHome: 'Home',
    navScan: 'Scan',
    navAi: 'AI',
    navHist: 'History',
    navProfile: 'Profile',

    // Home Screen
    welcomeText: 'Welcome, Selvam Farm',
    aiActiveText: 'AI Active',
    farmInfoText: 'Thanjavur • Paddy (Samba)',
    offlineChip: 'Offline Mode',
    modeSim: 'Prototype Mode',
    modeLive: 'Live ESP32 Mode',
    gaugeTitle: 'Soil Health Score',
    quickTitle: 'Quick Action Modules',
    actScan: 'Soil Scan',
    actAi: 'AI Analysis',
    actCrop: 'Crop Advisory',
    actFert: 'Fertilizer Advisory',
    actMicro: 'Micronutrients',
    actIrri: 'Irrigation',
    actCarbon: 'Carbon Footprint',
    actHist: 'History',
    actAnalytics: 'Analytics',

    // Soil Scan Screen
    pTitleMoist: 'Soil Moisture',
    pTitlePh: 'Soil pH',
    pTitleEc: 'EC Level',
    pTitleN: 'Nitrogen (N)',
    pTitleP: 'Phosphorous (P)',
    pTitleK: 'Potassium (K)',
    pTitleTemp: 'Soil Temperature',
    simTitle: 'Prototype Sensor Controls',
    sldTitleMoist: 'Soil Moisture (%)',
    sldTitlePh: 'Soil pH',
    sldTitleN: 'Nitrogen (N)',
    sldTitleP: 'Phosphorous (P)',
    sldTitleK: 'Potassium (K)',
    sldTitleTemp: 'Soil Temperature (°C)',
    btnRunAi: '🤖 Run AI Diagnostic Analysis',

    // AI Screen
    aiGaugeTitle: 'AI Health Evaluation',
    aiSummaryHeader: 'AI Agronomic Summary',
    aiSummaryText: 'Soil nutrient levels are balanced and highly fertile. Optimal for Paddy cultivation.',
    lblRisk: 'Risk Level',
    aiRisk: 'Low Risk',
    lblConf: 'Model Confidence',
    soilTitle: '🌱 Soil Type Detection',
    soilLabel: 'Soil Color',
    soilBtn: 'Analyze Soil',
    soilSelect: 'Select',
    soilRed: 'Red Soil',
    soilBlack: 'Black Soil',
    soilSandy: 'Sandy Soil',
    soilClay: 'Clay Soil',
    soilLoamy: 'Loamy Soil',

    // Fert Screen
    fertRecipeHeader: 'Targeted Fertilizer Recipe',
    fertName: 'Urea (46% N) & Organic Neem Cake',
    fertQty: 'Dosage: 25 kg / Acre',
    fertNpkHeader: 'NPK Status',
    fertNpkText: 'Nitrogen levels within target range. Maintain basal dose.',
    fertTimingHeader: 'Application Schedule',
    fertTimingText: 'Split into 2 doses: at sowing and 30 days after germination.',

    // Micro Screen
    microHeader: 'Trace Element Overview',
    microOverall: 'All essential trace micronutrients are within healthy agronomic bounds.',

    // Irri Screen
    irriTitle: 'Smart Precision Drip Schedule',
    irriVolume: '6,500 Liters / Acre',
    irriSavings: '42% Water Saved vs Flood',
    irriNextHeader: 'Next Watering Window',
    irriNextText: 'Tomorrow Early Morning (06:00 AM)',

    // Carbon Screen
    co2Val: '120.0 kg CO₂e / Acre',
    sustainRating: 'Rating: Low Impact (Eco-Friendly)',
    carbonRoadmapTitle: 'Eco Reduction Roadmap',
    carbonRoadmapText: '• Switch to precision drip irrigation to cut diesel pump emissions.\n\n• Adopt Neem-coated Urea to prevent N₂O greenhouse release.',

    // History
    histTitle: 'Offline Scan History',
    histItemTitle: 'Paddy (Samba) - Scan #104',
    histItemSub: 'Score: 84.5 • Optimal',

    // Analytics
    chartTitle: 'Soil Health Trend (5 Weeks)',

    // Profile
    profFarmTitle: 'Farm Details',
    profFarmDetails: '<strong>Farm:</strong> Green Agri Valley<br><strong>Location:</strong> Thanjavur, Tamil Nadu<br><strong>Acreage:</strong> 4.5 Acres<br><strong>Crop:</strong> Paddy (Samba)',

    // Settings
    settHwTitle: 'Hardware Connection Settings',
    settEnableLive: 'Enable Live ESP32 Hardware',
    hwDescSim: 'Currently using Prototype Simulated Values',
    hwDescLive: 'BLE Connected (ESP32-NPK-01)',
    settAiTitle: '🤖 AI Chatbot Configuration',
    settGroqLabel: 'Groq API Key',
    settGroqPlaceholder: 'Enter your Groq API key (gsk_...)',
    settGroqSaved: '✓ API key saved',
    settGroqEmpty: 'No API key set — NutriBot will not work',
    settGroqHelp: 'Get a free API key at console.groq.com',

    // Notifications
    notifTitle: 'Notifications',
    notifNew: 'new',
    notifMarkRead: 'Mark all read',
    notifEmpty: 'No notifications',
    notif1Title: 'Low Soil Moisture',
    notif1Msg: 'Moisture dropped to 38% — consider irrigation soon.',
    notif1Time: '2 min ago',
    notif2Title: 'Nitrogen Level Optimal',
    notif2Msg: 'N level is 135 mg/kg — within healthy range.',
    notif2Time: '1 hr ago',
    notif3Title: 'Soil Temperature Alert',
    notif3Msg: 'Temperature at 28.5°C — suitable for paddy growth.',
    notif3Time: '3 hr ago',
    notif4Title: 'Phosphorous Check',
    notif4Msg: 'P level at 45 mg/kg — consider adding phosphate fertilizer.',
    notif4Time: 'Yesterday'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('en');

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === 'ta' ? 'en' : 'ta'));
  };

  const dict = i18n[currentLang];

  return (
    <LanguageContext.Provider value={{ currentLang, toggleLanguage, dict, isTa: currentLang === 'ta' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
