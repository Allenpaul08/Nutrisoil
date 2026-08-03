import React from 'react';

const LoadingSpinner = ({ message = 'Connecting to ESP32 & Flask Backend...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #C8E6C9',
          borderTop: '4px solid #2E7D32',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <span style={{ marginTop: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--primary-green)' }}>
        {message}
      </span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
