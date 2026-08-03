import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const ProfileCard = () => {
  const { dict } = useLanguage();

  return (
    <>
      <div className="info-card" style={{ textAlign: 'center', marginBottom: '14px' }}>
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'var(--primary-green)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>person</span>
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>செல்வம் ராமநாதன்</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>+91 98765 43210</div>
      </div>

      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '10px' }}>
          {dict.profFarmTitle}
        </div>
        <div
          style={{ fontSize: '13px', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: dict.profFarmDetails }}
        />
      </div>
    </>
  );
};

export default ProfileCard;
