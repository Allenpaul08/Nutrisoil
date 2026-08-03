import React from 'react';

const SensorCard = ({ title, value, unit, icon, iconBg, iconColor }) => {
  return (
    <div className="param-card">
      <div className="param-header">
        <span className="param-title">{title}</span>
        {icon && (
          <span
            className="material-symbols-outlined param-icon"
            style={{ background: iconBg || '#E8F5E9', color: iconColor || '#2E7D32' }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="param-val">
        <span>{value}</span>
        {unit && <span className="param-unit">{unit}</span>}
      </div>
    </div>
  );
};

export default SensorCard;
