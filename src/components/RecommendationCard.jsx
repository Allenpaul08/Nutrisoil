import React from 'react';

const RecommendationCard = ({ icon, iconColor, title, description, badge, background }) => {
  return (
    <div className="info-card" style={{ background: background || 'white' }}>
      <div className="info-card-header">
        {icon && (
          <span className="material-symbols-outlined" style={{ color: iconColor || 'var(--primary-green)' }}>
            {icon}
          </span>
        )}
        <span className="info-card-title">{title}</span>
        {badge && <span className="gold-badge" style={{ marginLeft: 'auto' }}>{badge}</span>}
      </div>
      {description && <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{description}</div>}
    </div>
  );
};

export default RecommendationCard;
