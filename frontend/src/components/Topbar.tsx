import React from 'react';

interface TopbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  role: string | null;
  onLogout: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ theme, toggleTheme, role }) => {
  // Format user display name based on active authenticated role
  const getDisplayName = () => {
    if (role === 'SecurityAdmin') return 'Zoe Chauhan';
    if (role === 'FraudAnalyst') return 'Zoe (Analyst)';
    if (role === 'SystemOperator') return 'Zoe (Operator)';
    return 'Zoe Chauhan';
  };

  const getDisplayRole = () => {
    if (role === 'SecurityAdmin') return 'Admin';
    if (role === 'FraudAnalyst') return 'Fraud Analyst';
    if (role === 'SystemOperator') return 'Operator';
    return role || 'Admin';
  };

  return (
    <header className="willow-topbar">
      {/* Search Input Box */}
      <div className="willow-search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          type="text" 
          className="willow-search-input" 
          placeholder="Search here" 
        />
      </div>

      {/* Topbar Right Actions */}
      <div className="willow-topbar-right">
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

        {/* Notification Bell */}
        <div className="willow-bell-btn" title="Notifikasi Baru">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div className="willow-bell-dot"></div>
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
