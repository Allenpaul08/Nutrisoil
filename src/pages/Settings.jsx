import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { connectESP32BLE } from '../services/hardware';

const Settings = () => {
  const { dict } = useLanguage();
  const { isLiveHardware, toggleHardwareMode } = useHardware();

  const handleToggle = async (e) => {
    const checked = e.target.checked;
    if (checked) {
      const connected = await connectESP32BLE();
      if (!connected) {
        alert('BLE device not connected. Reverting to prototype mode.');
        toggleHardwareMode(false);
        return;
      }
    }
    toggleHardwareMode(checked);
  };

  return (
    <div className="screen">
      <div className="info-card">
        <div className="info-card-title">{dict.settHwTitle}</div>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{dict.settEnableLive}</span>
          <input
            type="checkbox"
            id="hwToggle"
            checked={isLiveHardware}
            onChange={handleToggle}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          {isLiveHardware ? dict.hwDescLive : dict.hwDescSim}
        </p>
      </div>
    </div>
  );
};

export default Settings;
