import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

// Static notification metadata (icons, colors, unread state, id)
// Titles, messages and times come from dict — auto-switch with language
const NOTIF_META = [
  { id: 1, icon: 'warning',    iconColor: '#E65100', iconBg: '#FFF3E0', unread: true,  titleKey: 'notif1Title', msgKey: 'notif1Msg', timeKey: 'notif1Time' },
  { id: 2, icon: 'eco',        iconColor: '#2E7D32', iconBg: '#E8F5E9', unread: true,  titleKey: 'notif2Title', msgKey: 'notif2Msg', timeKey: 'notif2Time' },
  { id: 3, icon: 'thermostat', iconColor: '#F57F17', iconBg: '#FFF8E1', unread: false, titleKey: 'notif3Title', msgKey: 'notif3Msg', timeKey: 'notif3Time' },
  { id: 4, icon: 'spa',        iconColor: '#C62828', iconBg: '#FCE4EC', unread: false, titleKey: 'notif4Title', msgKey: 'notif4Msg', timeKey: 'notif4Time' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dict } = useLanguage();

  const [notifOpen, setNotifOpen] = useState(false);
  // Track dismissed ids and read ids separately so language switch works
  const [dismissedIds, setDismissedIds] = useState([]);
  const [readIds, setReadIds]     = useState([]);

  const isHome = location.pathname === '/';

  // Build live notifications by merging meta with dict text
  const notifications = NOTIF_META
    .filter((n) => !dismissedIds.includes(n.id))
    .map((n) => ({
      ...n,
      title:   dict[n.titleKey] || n.titleKey,
      message: dict[n.msgKey]   || n.msgKey,
      time:    dict[n.timeKey]  || n.timeKey,
      unread:  n.unread && !readIds.includes(n.id),
    }));

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
