import React from 'react';
import { FileSpreadsheetIcon } from './Icons';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: string | null;
  pendingAlertsCount: number;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  role,
  pendingAlertsCount,
  onLogout
}) => {
  const isSuperAdmin = role === 'SecurityAdmin' || !role;
  const isAnalyst = role === 'FraudAnalyst';
  const isOperator = role === 'SystemOperator';

  const getRoleBadgeConfig = () => {
    if (isAnalyst) {
      return {
        label: 'FRAUD ANALYST',
        sub: 'Transaksi, Log & Enkripsi',
        bg: 'rgba(14, 165, 233, 0.12)',
        border: 'rgba(14, 165, 233, 0.3)',
        color: '#0284c7'
      };
    }
    if (isOperator) {
      return {
        label: 'SYSTEM OPERATOR',
        sub: 'Sandbox Demo & Simulator',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
        color: '#d97706'
      };
    }
    return {
      label: 'SUPER ADMIN',
      sub: 'Akses Penuh Seluruh Menu',
      bg: 'rgba(37, 99, 235, 0.12)',
      border: 'rgba(37, 99, 235, 0.3)',
      color: '#2563eb'
    };
  };

  const badge = getRoleBadgeConfig();

  return (
    <aside className="willow-sidebar">
      {/* Brand Logo & Name */}
      <div className="willow-brand">
        <div className="willow-brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div className="willow-brand-text">
          <span>JATELINDO</span>
          <span className="willow-brand-subtitle">Transaction SOC</span>
        </div>
      </div>

      {/* Role Access Indicator Pill */}
      <div
        style={{
          margin: '0 14px 12px 14px',
          padding: '8px 12px',
          borderRadius: '10px',
          backgroundColor: badge.bg,
          border: `1px solid ${badge.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}
      >
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: badge.color, letterSpacing: '0.5px' }}>
          {badge.label}
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {badge.sub}
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="willow-nav-menu">
        {/* SECTION 1: OPERASIONAL & ANALISIS (Super Admin & Fraud Analyst) */}
        {(isSuperAdmin || isAnalyst) && (
          <>
            <div className="sidebar-section-header">
              {isAnalyst ? 'ANALISIS & SEKURITAS' : 'OPERASIONAL SOC'}
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span>Dashboard</span>
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </span>
              <span>Transaksi</span>
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span>Manajemen User</span>
              <span
                style={{
                  marginLeft: 'auto',
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563eb',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}
              >
                120
              </span>
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span>Deteksi Fraud</span>
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <span>Alert Fraud</span>
              {pendingAlertsCount > 0 && (
                <span className="willow-nav-badge">{pendingAlertsCount}</span>
              )}
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'crypto' ? 'active' : ''}`}
              onClick={() => setActiveTab('crypto')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <span>Enkripsi & Sekuritas</span>
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <span>Audit Logs</span>
            </div>

            {isSuperAdmin && (
              <div
                className={`willow-nav-item ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span>Performance</span>
              </div>
            )}

            {/* SECTION 2: LAPORAN & PENELITIAN (Super Admin & Fraud Analyst) */}
            <div className="sidebar-section-header">LAPORAN & PENELITIAN</div>

            <div
              className={`willow-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="nav-icon">
                <FileSpreadsheetIcon size={18} />
              </span>
              <span>Laporan Evaluasi</span>
            </div>
          </>
        )}

        {/* SECTION 3: SANDBOX SIMULATOR & DEMO (Super Admin & System Operator) */}
        {(isSuperAdmin || isOperator) && (
          <>
            <div className="sidebar-section-header">
              {isOperator ? 'PORTAL DEMO & SIMULASI' : 'SANDBOX SIMULATOR'}
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'demo' ? 'active' : ''}`}
              onClick={() => setActiveTab('demo')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7.5" cy="15.5" r="5.5" />
                  <path d="m21 2-9.6 9.6" />
                  <path d="m15.5 7.5 3 3L22 7l-3-3" />
                </svg>
              </span>
              <span>Demo Kriptografi</span>
            </div>

            <div
              className={`willow-nav-item ${activeTab === 'mobile' ? 'active' : ''}`}
              onClick={() => setActiveTab('mobile')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </span>
              <span>Generator QRIS & VA</span>
            </div>

            {isOperator && (
              <div
                className={`willow-nav-item ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span>Simulasi Beban & TPS</span>
              </div>
            )}
          </>
        )}
      </nav>

      {/* Bottom Footer Section */}
      <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div
          className="willow-nav-item"
          style={{ padding: '9px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}
          onClick={() => setActiveTab(isAnalyst ? 'crypto' : 'demo')}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <span>Bantuan & Panduan</span>
        </div>

        <div
          className="willow-nav-item"
          style={{ padding: '9px 14px', fontSize: '0.82rem', color: '#ef4444' }}
          onClick={onLogout}
        >
          <span className="nav-icon" style={{ color: '#ef4444' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span style={{ fontWeight: 600 }}>Keluar (Logout)</span>
        </div>
      </div>
    </aside>
  );
};
