import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ProfileCard = () => {
  const { dict } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      {/* Avatar + Name Card */}
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
            margin: '0 auto 10px auto',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>person</span>
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>செல்வம் ராமநாதன்</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>+91 98765 43210</div>
      </div>

      {/* Farm Details Card */}
      <div className="info-card">
        <div className="info-card-title" style={{ marginBottom: '10px' }}>
          {dict.profFarmTitle}
        </div>
        <div
          style={{ fontSize: '13px', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: dict.profFarmDetails }}
        />
      </div>

      {/* Settings Button */}
      <button
        id="goToSettingsBtn"
        onClick={() => navigate('/settings')}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 18px',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          cursor: 'pointer',
          boxShadow: 'var(--card-shadow)',
          transition: 'all 0.2s ease',
          marginBottom: '12px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--card-shadow)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'white' }}>
              settings
            </span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>
              {dict.settHwTitle.replace('Hardware Connection ', '').replace('வன்பொருள் இணைப்பு ', '') || 'Settings'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {dict.settAiTitle || 'AI · Hardware Configuration'}
            </div>
          </div>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-muted)' }}>
          chevron_right
        </span>
      </button>
    </>
  );
};

export default ProfileCard;
