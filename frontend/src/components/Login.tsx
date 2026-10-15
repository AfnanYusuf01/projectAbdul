import React, { useState } from 'react';
import { ShieldIcon, SearchIcon } from './Icons';
import './Login.css';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  isBackendOnline?: boolean;
}

export const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  theme = 'light', 
  toggleTheme, 
  isBackendOnline = false 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onLogin(username.trim(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login gagal. Periksa kembali kredensial Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (user: string) => {
    setSelectedRole(user);
    setUsername(user);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="willow-login-wrapper">
      {/* Top Header Bar */}
      <div className="willow-login-topbar">
        <div className="willow-login-status-pill">
          <span className={`willow-status-dot ${isBackendOnline ? 'online' : 'offline'}`} />
          <span>{isBackendOnline ? 'Backend API Terhubung' : 'Simulator Mandiri (Offline)'}</span>
        </div>

        {toggleTheme && (
          <button 
            type="button" 
            className="willow-login-theme-btn" 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="willow-login-card">
        {/* Brand Header */}
        <div className="willow-login-header">
          <div className="willow-login-logo-mark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div className="willow-login-brand-title">
            <span>JATELINDO</span>
            <span className="willow-login-brand-badge">SOC PORTAL</span>
          </div>
          <p className="willow-login-subtitle">
            Sistem Pemantauan Keamanan Transaksi & Deteksi Fraud Elektronik
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="willow-login-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="willow-login-form">
          <div className="willow-form-field">
            <label className="willow-form-label" htmlFor="login-username">
              Username
            </label>
            <div className="willow-input-container">
              <span className="willow-input-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                id="login-username"
                type="text"
                className="willow-login-input"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setSelectedRole(null);
                }}
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="willow-form-field">
            <label className="willow-form-label" htmlFor="login-password">
              Kata Sandi
            </label>
            <div className="willow-input-container">
              <span className="willow-input-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="willow-login-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="willow-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="willow-login-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="willow-spinner" />
                <span>Mengautentikasi Sesi...</span>
              </>
            ) : (
              <>
                <span>Masuk Ke Portal</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Quick Simulator Role Buttons */}
        <div className="willow-quick-login-section">
          <span className="willow-quick-title">
            Akses Cepat Simulator (Pilih Profil)
          </span>
          <div className="willow-quick-roles">
            <button 
              type="button"
              className={`willow-quick-role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleQuickSelect('admin')}
              disabled={loading}
            >
              <span className="willow-role-icon"><ShieldIcon size={20} /></span>
              <span className="willow-role-label">Super Admin</span>
            </button>
            <button 
              type="button"
              className={`willow-quick-role-btn ${selectedRole === 'analyst' ? 'active' : ''}`}
              onClick={() => handleQuickSelect('analyst')}
              disabled={loading}
            >
              <span className="willow-role-icon"><SearchIcon size={20} /></span>
              <span className="willow-role-label">Analyst</span>
            </button>
            <button 
              type="button"
              className={`willow-quick-role-btn ${selectedRole === 'operator' ? 'active' : ''}`}
              onClick={() => handleQuickSelect('operator')}
              disabled={loading}
            >
              <span className="willow-role-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </span>
              <span className="willow-role-label">Operator Demo</span>
            </button>
          </div>
          <div className="willow-quick-hint">
            <span>Kata sandi default:</span>
            <code className="willow-quick-code">password123</code>
          </div>
        </div>

        {/* Security Footer */}
        <div className="willow-login-footer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Enkripsi TLS 256-bit • Portal Keamanan Transaksi Bersertifikat</span>
        </div>
      </div>
    </div>
  );
};
