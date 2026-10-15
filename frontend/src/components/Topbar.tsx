import React, { useState } from 'react';
import type { SystemNotification, PerformanceMetrics } from '../types';
import { NotificationDropdown } from './NotificationDropdown';

interface TopbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  role: string | null;
  onLogout: () => void;
  notifications?: SystemNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearNotifications?: () => void;
  onNavigate?: (tab: string, itemData?: unknown) => void;
  metrics?: PerformanceMetrics;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  theme, 
  toggleTheme, 
  role,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onClearNotifications = () => {},
  onNavigate = () => {},
  metrics
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  // Format user display name based on active authenticated role
  const getDisplayName = () => {
    if (role === 'SecurityAdmin') return 'Zoe Chauhan (Admin)';
    if (role === 'FraudAnalyst') return 'Zoe (Analyst)';
    if (role === 'SystemOperator') return 'Zoe (Operator)';
    return 'Zoe Chauhan';
  };

  const getDisplayRole = () => {
    if (role === 'SecurityAdmin') return 'Super Admin';
    if (role === 'FraudAnalyst') return 'Fraud & Crypto Analyst';
    if (role === 'SystemOperator') return 'Sandbox Demo Operator';
    return role || 'Super Admin';
  };

  return (
    <header className="willow-topbar">
      {/* Search Input Box */}
      <div className="willow-search-box" style={{ width: '380px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          type="text" 
          className="willow-search-input" 
          placeholder="Cari transaksi, ID, nasabah, atau referensi..." 
        />
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '5px', border: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
          Ctrl + K
        </span>
      </div>

      {/* Topbar Right Actions */}
      <div className="willow-topbar-right">
        {/* Real-Time Server RAM & CPU Performance Pill */}
        {metrics && (
          <div
            onClick={() => {
              if (role !== 'FraudAnalyst') onNavigate('performance');
            }}
            title={`Telemetri Server Real-Time (psutil)\nRAM: ${metrics.memory_usage}% | CPU: ${metrics.cpu_usage}%\nLatensi Enkripsi: ${metrics.avg_encryption_time_ms} ms | Thread Aktif: ${metrics.active_connections}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 13px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              cursor: role !== 'FraudAnalyst' ? 'pointer' : 'default',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}
          >
            {/* RAM Usage with Mini Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: metrics.memory_usage > 85 ? '#ef4444' : metrics.memory_usage > 70 ? '#f59e0b' : '#10b981',
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
                }}
              />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>RAM</span>
              <span style={{ fontWeight: 800, color: metrics.memory_usage > 85 ? '#ef4444' : 'var(--text-primary)' }}>
                {metrics.memory_usage}%
              </span>
              <div
                style={{
                  width: '36px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(148, 163, 184, 0.25)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(5, metrics.memory_usage))}%`,
                    height: '100%',
                    borderRadius: '3px',
                    backgroundColor: metrics.memory_usage > 85 ? '#ef4444' : metrics.memory_usage > 70 ? '#f59e0b' : '#2563eb',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            <span style={{ color: 'var(--border-color)' }}>|</span>

            {/* CPU Usage */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>CPU</span>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{metrics.cpu_usage}%</span>
            </div>
          </div>
        )}

        {/* Sun / Moon Theme Switcher */}
        <div className="willow-theme-switch" onClick={toggleTheme} title="Beralih Mode Terang / Gelap">
          <div className={`willow-theme-pill ${theme === 'light' ? 'active' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </div>
          <div className={`willow-theme-pill ${theme === 'dark' ? 'active' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
        </div>

        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            className="willow-bell-btn" 
            onClick={() => setIsNotifOpen(prev => !prev)}
            title="Notifikasi Sistem & Fraud"
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span 
                className="willow-bell-badge"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid var(--bg-surface)',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.45)',
                  animation: 'pulse 2s infinite'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearAll={onClearNotifications}
            onNavigate={onNavigate}
          />
        </div>

        {/* User Profile Pill */}
        <div className="willow-user-profile">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
            alt="User Avatar" 
            className="willow-user-avatar"
          />
          <div className="willow-user-info">
            <span className="willow-user-name">{getDisplayName()}</span>
            <span className="willow-user-role">{getDisplayRole()}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </header>
  );
};
