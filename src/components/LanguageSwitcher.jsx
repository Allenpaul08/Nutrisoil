import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { toggleLanguage, dict } = useLanguage();

  return (
    <button className="lang-pill" onClick={toggleLanguage}>
      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>translate</span>
      <span>{dict.langText}</span>
    </button>
  );
};

export default LanguageSwitcher;
