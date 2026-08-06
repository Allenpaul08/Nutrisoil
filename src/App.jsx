import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { HardwareProvider } from './context/HardwareContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import NutriAssistAI from './components/NutriAssistAI';

import Home from './pages/Home';
import Scan from './pages/Scan';
import AIAnalysis from './pages/AIAnalysis';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import CropAdvisory from './pages/CropAdvisory';
import FertilizerAdvisory from './pages/FertilizerAdvisory';
import Micronutrients from './pages/Micronutrients';
import Irrigation from './pages/Irrigation';
import CarbonFootprint from './pages/CarbonFootprint';
import Settings from './pages/Settings';

import './styles/global.css';

function App() {
  return (
    <LanguageProvider>
      <HardwareProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app-container">
            <Navbar />

            <div className="screens-container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/ai" element={<AIAnalysis />} />
                <Route path="/crop" element={<CropAdvisory />} />
                <Route path="/fertilizer" element={<FertilizerAdvisory />} />
                <Route path="/micronutrients" element={<Micronutrients />} />
                <Route path="/irrigation" element={<Irrigation />} />
                <Route path="/carbon" element={<CarbonFootprint />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>

            <NutriAssistAI />
            <BottomNav />
          </div>
        </Router>
      </HardwareProvider>
    </LanguageProvider>
  );
}

export default App;
