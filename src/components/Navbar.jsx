import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import LanguageSwitcher from './LanguageSwitcher';

// Static notification metadata (icons, colors, unread state, id)
const NOTIF_META = [
  { id: 1, icon: 'warning',    iconColor: '#E65100', iconBg: '#FFF3E0', unread: true },
  { id: 2, icon: 'eco',        iconColor: '#2E7D32', iconBg: '#E8F5E9', unread: true },
  { id: 3, icon: 'thermostat', iconColor: '#F57F17', iconBg: '#FFF8E1', unread: false },
  { id: 4, icon: 'spa',        iconColor: '#C62828', iconBg: '#FCE4EC', unread: false },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dict, isTa } = useLanguage();
  const { sensorState, mlResult } = useHardware();

  const [notifOpen, setNotifOpen] = useState(false);
  // Track dismissed ids and read ids separately so language switch works
  const [dismissedIds, setDismissedIds] = useState([]);
  const [readIds, setReadIds]     = useState([]);

  const isHome = location.pathname === '/';

  const moistVal = parseFloat(sensorState?.moisture ?? 0).toFixed(1);
  const nVal = Math.round(sensorState?.nitrogen ?? 0);
  const pVal = Math.round(sensorState?.phosphorus ?? sensorState?.phosphorous ?? 0);
  const kVal = Math.round(sensorState?.potassium ?? 0);
  const tempVal = parseFloat(sensorState?.temperature ?? 0).toFixed(1);

  const getDynamicNotif = (id) => {
    switch (id) {
      case 1:
        return {
          title: isTa ? (parseFloat(moistVal) < 30 ? 'மண் ஈரம் குறைவு' : 'மண் ஈரம் நிலை') : (parseFloat(moistVal) < 30 ? 'Low Soil Moisture' : 'Soil Moisture Status'),
          message: parseFloat(moistVal) < 30
            ? (isTa ? `ஈரம் ${moistVal}% ஆக உள்ளது — விரைவில் நீர்ப்பாசனம் செய்யுங்கள்.` : `Moisture at ${moistVal}% — consider irrigation soon.`)
            : (isTa ? `ஈரம் ${moistVal}% ஆக உள்ளது — போதுமான ஈரப்பதம்.` : `Moisture level is ${moistVal}% — adequate soil moisture.`),
          time: isTa ? '2 நிமிடம் முன்' : '2 min ago'
        };
      case 2:
        return {
          title: isTa ? 'நைட்ரஜன் நிலை' : 'Nitrogen Level',
          message: isTa ? `N அளவு ${nVal} mg/kg — நேரலை அளவீடு.` : `N level is ${nVal} mg/kg — live reading.`,
          time: isTa ? '1 மணி முன்' : '1 hr ago'
        };
      case 3:
        return {
          title: isTa ? 'மண் வெப்பநிலை எச்சரிக்கை' : 'Soil Temperature',
          message: mlResult?.crop
            ? (isTa ? `வெப்பநிலை ${tempVal}°C — ${mlResult.crop} பயிர் வளர்ச்சிக்கு நேரலை சூழல்.` : `Temperature at ${tempVal}°C — live environment for ${mlResult.crop.charAt(0).toUpperCase() + mlResult.crop.slice(1)}.`)
            : (isTa ? `வெப்பநிலை ${tempVal}°C — நேரலை மண் வெப்பநிலை.` : `Temperature at ${tempVal}°C — current soil temperature.`),
          time: isTa ? '3 மணி முன்' : '3 hr ago'
        };
      case 4:
        return {
          title: isTa ? 'பாஸ்பரஸ் & பொட்டாசியம் சரிபார்ப்பு' : 'Phosphorous & Potassium Status',
          message: isTa ? `P அளவு ${pVal} mg/kg, K அளவு ${kVal} mg/kg — நேரலை அளவீடுகள்.` : `P level at ${pVal} mg/kg, K level at ${kVal} mg/kg — live readings.`,
          time: isTa ? 'நேற்று' : 'Yesterday'
        };
      default:
        return { title: '', message: '', time: '' };
    }
  };

  // Build live notifications by merging meta with dynamic sensor text
  const notifications = NOTIF_META
    .filter((n) => !dismissedIds.includes(n.id))
    .map((n) => {
      const dyn = getDynamicNotif(n.id);
      return {
        ...n,
        title: dyn.title,
        message: dyn.message,
        time: dyn.time,
        unread: n.unread && !readIds.includes(n.id),
      };
    });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':               return dict.appTitle;
      case '/scan':           return dict.actScan;
      case '/ai':             return dict.actAi;
      case '/crop':           return dict.actCrop;
      case '/fertilizer':     return dict.actFert;
      case '/micronutrients': return dict.actMicro;
      case '/irrigation':     return dict.actIrri;
      case '/carbon':         return dict.actCarbon;
      case '/history':        return dict.actHist;
      case '/analytics':      return dict.actAnalytics;
      case '/profile':        return dict.navProfile;
      case '/settings':       return '⚙️ Settings';
      default:                return dict.appTitle;
    }
  };

  const markAllRead = () => {
    setReadIds(NOTIF_META.map((n) => n.id));
  };

  const dismissNotif = (id) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <>
      <div className="app-bar">
        <div className="app-bar-left">
          {!isHome && (
            <button className="icon-btn" onClick={() => navigate(-1)}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <span className="app-title">{getPageTitle()}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Notification Bell */}
          <button
            id="notif-bell-btn"
            className="icon-btn"
            onClick={() => setNotifOpen((prev) => !prev)}
            style={{ position: 'relative' }}
            aria-label={dict.notifTitle}
          >
            <span className="material-symbols-outlined">
              {notifOpen ? 'notifications_active' : 'notifications'}
            </span>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          <LanguageSwitcher />
        </div>
      </div>

      {/* Notification Panel Dropdown */}
      {notifOpen && (
        <>
          {/* Backdrop */}
          <div
            className="notif-backdrop"
            onClick={() => setNotifOpen(false)}
          />

          <div className="notif-panel" id="notif-panel">
            <div className="notif-panel-header">
              <span className="notif-panel-title">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}
                >
                  notifications
                </span>
                {dict.notifTitle}
                {unreadCount > 0 && (
                  <span className="notif-count-chip">{unreadCount} {dict.notifNew}</span>
                )}
              </span>
              {unreadCount > 0 && (
                <button className="notif-mark-read-btn" onClick={markAllRead}>
                  {dict.notifMarkRead}
                </button>
              )}
            </div>

            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '40px', color: '#A5D6A7', display: 'block', marginBottom: '8px' }}
                  >
                    notifications_off
                  </span>
                  {dict.notifEmpty}
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-item${notif.unread ? ' notif-unread' : ''}`}
                  >
                    <div
                      className="notif-icon-circle"
                      style={{ background: notif.iconBg, color: notif.iconColor }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {notif.icon}
                      </span>
                    </div>
                    <div className="notif-content">
                      <div className="notif-item-title">{notif.title}</div>
                      <div className="notif-item-msg">{notif.message}</div>
                      <div className="notif-item-time">{notif.time}</div>
                    </div>
                    <button
                      className="notif-dismiss-btn"
                      onClick={() => dismissNotif(notif.id)}
                      aria-label="Dismiss"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
