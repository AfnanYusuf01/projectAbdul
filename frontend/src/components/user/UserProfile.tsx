import React from 'react';
import type { UserProfileData } from './UserTypes';

interface UserProfileProps {
  user: UserProfileData;
  balance: number;
  onLogout: () => void;
  onBackToHome: () => void;
  onUnderDevelopment?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  balance,
  onLogout,
  onBackToHome: _onBackToHome,
  onUnderDevelopment
}) => {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
      {/* 1. Header Profile Banner */}
      <div style={{
        background: 'var(--jpay-primary-gradient)',
        padding: '24px 18px 28px 18px',
        color: '#ffffff',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.4)',
              objectFit: 'cover'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
              {user.phone}
            </div>
            {/* KYC Verified Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(6px)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.68rem',
              fontWeight: 700,
              marginTop: '6px'
            }}>
              <span>✓ J-Pay Premium Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Saldo Pill */}
        <div style={{
          marginTop: '16px',
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: '14px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.25)'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>Saldo J-Pay Aktif</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>Rp {balance.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ fontSize: '0.72rem', opacity: 0.85, fontFamily: 'monospace' }}>
            ID: {user.accountNumber}
          </div>
        </div>
      </div>

      {/* 2. Menu List */}
      <div style={{ padding: '16px 16px 80px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Card Section 1: Security & Protection */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '12px 16px', border: '1px solid var(--jpay-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--jpay-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Keamanan & Akun
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => onUnderDevelopment?.()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>🔒</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--jpay-text-main)' }}>Ubah PIN Keamanan</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--jpay-text-muted)' }}>Atur ulang 6 digit PIN transaksi</div>
                </div>
              </div>
              <span style={{ color: 'var(--jpay-text-muted)' }}>›</span>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--jpay-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => onUnderDevelopment?.()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--jpay-text-main)' }}>J-Pay Protection</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--jpay-text-muted)' }}>Jaminan keamanan saldo 100%</div>
                </div>
              </div>
              <span style={{ color: 'var(--jpay-accent-green)', fontWeight: 800, fontSize: '0.7rem' }}>Aktif</span>
            </div>
          </div>
        </div>

        {/* Card Section 2: Layanan & Bantuan */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '12px 16px', border: '1px solid var(--jpay-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--jpay-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Layanan Pelanggan
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => onUnderDevelopment?.()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>🏦</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--jpay-text-main)' }}>Rekening Bank Tersimpan</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--jpay-text-muted)' }}>Kelola daftar rekening tujuan cepat</div>
                </div>
              </div>
              <span style={{ color: 'var(--jpay-text-muted)' }}>›</span>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--jpay-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => onUnderDevelopment?.()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>💬</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--jpay-text-main)' }}>Pusat Bantuan Pelanggan</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--jpay-text-muted)' }}>Layanan bantuan pelanggan 24/7</div>
                </div>
              </div>
              <span style={{ color: 'var(--jpay-text-muted)' }}>›</span>
            </div>
          </div>
        </div>

        {/* Card Section 3: Logout */}
        <div style={{ padding: '4px' }}>
          <button
            type="button"
            onClick={onLogout}
            style={{
              width: '100%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Keluar Akun (Logout)
          </button>
        </div>
      </div>
    </div>
  );
};
