import React from 'react';

const ActionCard = ({ icon, iconBg, iconColor, label, labelId, onClick }) => {
  return (
    <div className="action-card" onClick={onClick}>
      <div
        className="action-icon-circle"
        style={{ background: iconBg, color: iconColor }}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="action-label" id={labelId}>
        {label}
      </span>
    </div>
  );
};

export default ActionCard;
