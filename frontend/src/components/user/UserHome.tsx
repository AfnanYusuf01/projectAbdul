import React, { useState } from 'react';
import type { UserProfileData, UserScreen } from './UserTypes';

interface UserHomeProps {
  user: UserProfileData;
  balance: number;
  onNavigate: (screen: UserScreen) => void;
  onUnderDevelopment: () => void;
}

export const UserHome: React.FC<UserHomeProps> = ({
  user: _user,
  balance,
  onNavigate,
  onUnderDevelopment
}) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 1. Header with Balance & 4 Action Pills (Image #3) */}
      <header className="jpay-header">
        <div className="jpay-header-top">
          {/* Left: J-Pay Logo Badge & Balance */}
          <div className="jpay-balance-area" onClick={() => setShowBalance(!showBalance)}>
            <div className="jpay-logo-badge">
              <span>J</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>
                Rp
              </span>
              <span className="jpay-balance-val">
                {showBalance ? balance.toLocaleString('id-ID') : '••••••••'}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Right: Message / Inbox Icon with red dot (Image #3) */}
          <div className="jpay-header-actions">
            <button className="jpay-header-icon-btn" onClick={onUnderDevelopment}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div className="jpay-notif-dot" />
            </button>
          </div>
        </div>

        {/* 4 Action Pills Grid (Image #3: Scan, Top up, Send, Request) */}
        <div className="jpay-actions-grid">
          {/* 1. Scan (QRIS) */}
          <button className="jpay-action-pill" onClick={() => onNavigate('qris_pay')}>
            <div className="jpay-action-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <span className="jpay-action-label">Scan</span>
          </button>

          {/* 2. Top up */}
          <button className="jpay-action-pill" onClick={onUnderDevelopment}>
            <div className="jpay-action-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="4" />
                <line x1="12" y1="9" x2="12" y2="15" />
                <line x1="9" y1="12" x2="15" y2="12" />
              </svg>
            </div>
            <span className="jpay-action-label">Top up</span>
          </button>

          {/* 3. Send (Transfer Bank & VA) */}
          <button className="jpay-action-pill" onClick={() => onNavigate('transfer_bank')}>
            <div className="jpay-action-icon-box">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>Rp</span>
              </div>
            </div>
            <span className="jpay-action-label">Send</span>
          </button>

          {/* 4. Request */}
          <button className="jpay-action-pill" onClick={onUnderDevelopment}>
            <div className="jpay-action-icon-box">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>Rp</span>
              </div>
            </div>
            <span className="jpay-action-label">Request</span>
          </button>
        </div>
      </header>

      {/* 2. Scrollable Body Content (Image #3) */}
      <div className="jpay-scroll-body">
        {/* Combined White Card: Electricity + 8 Services Grid (Exact Image #3) */}
        <div className="jpay-card" style={{ padding: '14px 12px' }}>
          {/* Electricity Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '14px' }}>
            <div className="jpay-electricity-left">
              <div className="jpay-electricity-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
                </svg>
              </div>
              <div>
                <div className="jpay-electricity-title">Electricity</div>
                <div className="jpay-electricity-sub">Pay electric bills here!</div>
              </div>
            </div>
            <button className="jpay-btn-pay-now" onClick={onUnderDevelopment}>
              PAY NOW
            </button>
          </div>

          {/* 8 Grid Services (Exact Image #3) */}
          <div className="jpay-services-grid" style={{ padding: '4px 0' }}>
            <button className="jpay-service-item" onClick={onUnderDevelopment}>
              <div className="jpay-service-icon-box" style={{ background: '#fffbeb', color: '#f59e0b', position: 'relative' }}>
                <span style={{ fontWeight: 900, fontSize: '0.95rem', border: '2px solid #f59e0b', borderRadius: '6px', padding: '1px 5px' }}>%</span>
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              </div>
              <span className="jpay-service-label">J-Pay<br />Deals</span>
            </button>

            <button className="jpay-service-item" onClick={onUnderDevelopment}>
              <div className="jpay-service-icon-box" style={{ background: '#e0f2fe', color: '#0284c7', position: 'relative' }}>
                <span>🎁</span>
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              </div>
              <span className="jpay-service-label">Voucher A+<br />Rewards</span>
            </button>

            <button className="jpay-service-item" onClick={onUnderDevelopment}>
              <div className="jpay-service-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                <span>🪙</span>
              </div>
              <span className="jpay-service-label">eMAS</span>
            </button>

            <button className="jpay-service-item" onClick={onUnderDevelopment}>
              <div className="jpay-service-icon-box" style={{ background: '#fee2e2', color: '#ef4444' }}>
                <span>🎯</span>
              </div>
              <span className="jpay-service-label">J-Pay<br />Goals</span>
            </button>

            <button className="jpay-service-item" onClick={onUnderDevelopment}>
              <div className="jpay-service-icon-box" style={{ background: '#f0fdf4', color: '#10b981' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0284c7">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="jpay-service-label">Google<br />Play Store</span>
            </button>

            <button className="jpay-service-item" onClick={onUnderDevelopment}>
              <div className="jpay-service-icon-box" style={{ background: '#fee2e2', color: '#ef4444' }}>
                <div style={{ width: '22px', height: '28px', borderRadius: '4px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.62rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Rp
                </div>
              </div>
              <span className="jpay-service-label">Pulsa &<br />Data</span>
            </button>

            <button className="jpay-service-item" onClick={onUnderDevelopment}>
              <div className="jpay-service-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <div style={{ width: '22px', height: '28px', borderRadius: '4px', backgroundColor: '#0284c7', color: '#ffffff', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🧧
                </div>
              </div>
              <span className="jpay-service-label">J-Pay<br />Kaget</span>
            </button>

            <button className="jpay-service-item" onClick={onUnderDevelopment}>
              <div className="jpay-service-icon-box" style={{ background: '#f8fafc', color: '#64748b' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                </div>
              </div>
              <span className="jpay-service-label">View All</span>
            </button>
          </div>
        </div>

        {/* Feed Section (Exact Image #3) */}
        <div className="jpay-feed-card">
          <div className="jpay-feed-header">
            <div>
              <div className="jpay-feed-title">Feed</div>
              <div className="jpay-feed-sub">Find out what your friends are up to!</div>
            </div>
            <button className="jpay-btn-explore" onClick={onUnderDevelopment}>
              EXPLORE
            </button>
          </div>

          <div className="jpay-feed-item">
            <div className="jpay-feed-avatar">
              👤
            </div>
            <div className="jpay-feed-text">
              <strong>Your Friend</strong> just received <strong>Cashback</strong> from <span style={{ color: '#f59e0b', fontWeight: 700 }}>Merchant</span>
            </div>
          </div>
        </div>

        {/* Promo Banner Carousel Card (Exact Image #3) */}
        <div className="jpay-banner-card" onClick={onUnderDevelopment} style={{ cursor: 'pointer' }}>
          <div>
            <span className="jpay-banner-badge">24 PAYDAY</span>
            <div className="jpay-banner-title">Menangkan hadiah uang tunai RP 1 JT</div>
            <div className="jpay-banner-sub" style={{ marginTop: '4px' }}>
              <span style={{ backgroundColor: '#a3e635', color: '#0f172a', fontWeight: 800, fontSize: '0.66rem', padding: '3px 10px', borderRadius: '10px' }}>
                SERBU SEKARANG
              </span>
            </div>
          </div>
          <div style={{ fontSize: '2.2rem' }}>
            🎮
          </div>
        </div>
      </div>
    </div>
  );
};
