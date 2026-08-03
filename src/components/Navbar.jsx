import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dict } = useLanguage();

  const isHome = location.pathname === '/';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return dict.appTitle;
      case '/scan': return dict.actScan;
      case '/ai': return dict.actAi;
      case '/crop': return dict.actCrop;
      case '/fertilizer': return dict.actFert;
      case '/micronutrients': return dict.actMicro;
      case '/irrigation': return dict.actIrri;
      case '/carbon': return dict.actCarbon;
      case '/history': return dict.actHist;
      case '/analytics': return dict.actAnalytics;
      case '/profile': return dict.navProfile;
      case '/settings': return dict.settHwTitle;
      default: return dict.appTitle;
    }
  };

  return (
    <div className="app-bar">
      <div className="app-bar-left">
        {!isHome && (
          <button className="icon-btn" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <span className="app-title">{getPageTitle()}</span>
      </div>
      <LanguageSwitcher />
    </div>
  );
};

export default Navbar;
