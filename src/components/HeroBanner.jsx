import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';

const HeroBanner = () => {
  const { dict } = useLanguage();
  const { isLiveHardware } = useHardware();

  return (
    <div className="hero-banner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '16px', fontWeight: '700' }} id="welcomeText">
          {dict.welcomeText}
        </span>
        <span className="gold-badge" id="aiActiveText">
          {dict.aiActiveText}
        </span>
      </div>

      <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }} id="farmInfoText">
        {dict.farmInfoText}
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className="status-chip">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>wifi_off</span>
          <span id="offlineChip">{dict.offlineChip}</span>
        </span>

        <span
          className="status-chip"
          id="modeChipBg"
          style={{ background: isLiveHardware ? 'rgba(46, 125, 50, 0.8)' : 'rgba(230, 81, 0, 0.8)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }} id="modeIcon">tune</span>
          <span id="modeChipText">{isLiveHardware ? dict.modeLive : dict.modeSim}</span>
        </span>
      </div>
    </div>
  );
};

export default HeroBanner;
