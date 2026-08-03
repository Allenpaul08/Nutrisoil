import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const BottomNav = () => {
  const { dict } = useLanguage();

  return (
    <div className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
        <span className="material-symbols-outlined">home</span>
        <span>{dict.navHome}</span>
      </NavLink>

      <NavLink to="/scan" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
        <span className="material-symbols-outlined">sensors</span>
        <span>{dict.navScan}</span>
      </NavLink>

      <NavLink to="/ai" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
        <span className="material-symbols-outlined">psychology</span>
        <span>{dict.navAi}</span>
      </NavLink>

      <NavLink to="/history" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
        <span className="material-symbols-outlined">history</span>
        <span>{dict.navHist}</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
        <span className="material-symbols-outlined">person</span>
        <span>{dict.navProfile}</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
