import React, { useState, useRef } from 'react';
import type { UserProfileData } from './UserTypes';
import { REGISTERED_USERS } from './UserWalletStore';
import { MobileNumericKeyboard } from './MobileNumericKeyboard';

interface UserLoginProps {
  onLoginSuccess: (user: UserProfileData) => void;
}

export const UserLogin: React.FC<UserLoginProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('081234567890');
  const [pin, setPin] = useState('');
  const pinRef = useRef('');
  const [step, setStep] = useState<'phone' | 'pin'>('phone');
  const [error, setError] = useState<string | null>(null);

  const USERS: UserProfileData[] = REGISTERED_USERS.map((u) => ({
    phone: u.phone,
    name: u.name,
    avatarUrl: u.avatarUrl,
    isKycVerified: true,
    pin: '123456',
    accountNumber: u.account
  }));

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const withoutCountry = digits.startsWith('62') ? digits.slice(2) : digits;
    const core = withoutCountry.replace(/^0+/, '');
    return core ? '0' + core : '';
  };

  const handlePhoneProceed = () => {
    setError(null);
    const normalized = normalizePhone(phone);
    if (!normalized || normalized.length < 9) {
      setError('Masukkan nomor ponsel yang terdaftar.');
      return;
    }
    const matched = USERS.find((u) => normalizePhone(u.phone) === normalized);
    if (!matched) {
      setError('Nomor ponsel tidak ditemukan.');
      return;
    }
    setPhone(matched.phone);
    pinRef.current = '';
    setPin('');
    setStep('pin');
  };

  const verifyPin = (enteredPin: string) => {
    const normalized = normalizePhone(phone);
    const matched = USERS.find((u) => normalizePhone(u.phone) === normalized);
    if (!matched) {
      setError('Akun tidak ditemukan.');
      return;
    }
    if (enteredPin === matched.pin) {
      onLoginSuccess(matched);
    } else {
      setError('PIN yang Anda masukkan salah.');
      pinRef.current = '';
      setPin('');
    }
  };

  const handleDigit = (digit: string) => {
    setError(null);
    if (step === 'phone') {
      setPhone((prev) => {
        const core = prev.replace(/^0+/, '');
        const nextCore = (core + digit).replace(/\D/g, '').replace(/^0+/, '').slice(0, 12);
        return nextCore ? '0' + nextCore : '';
      });
    } else {
      if (pinRef.current.length >= 6) return;
      const nextPin = pinRef.current + digit;
      pinRef.current = nextPin;
      setPin(nextPin);
      if (nextPin.length === 6) {
        setTimeout(() => verifyPin(nextPin), 60);
      }
    }
  };

  const handleBackspace = () => {
    setError(null);
    if (step === 'phone') {
      setPhone((prev) => {
        const core = prev.replace(/^0+/, '');
        const nextCore = core.slice(0, -1);
        return nextCore ? '0' + nextCore : '';
      });
    } else {
      pinRef.current = pinRef.current.slice(0, -1);
      setPin(pinRef.current);
    }
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', height: '100%', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{
        background: 'var(--jpay-primary-gradient)',
        padding: '32px 20px 26px 20px',
        color: '#ffffff',
        textAlign: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            border: '2px solid rgba(255, 255, 255, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.25rem'
          }}>
            J
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
            J-Pay
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.92)', fontWeight: 500 }}>
          {step === 'phone' ? 'Masukkan nomor HP kamu untuk lanjut' : 'Masukkan 6 digit PIN J-Pay kamu'}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {step === 'phone' ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--jpay-text-muted)', display: 'block', marginBottom: '8px' }}>
                Nomor Handphone
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid var(--jpay-primary)',
                borderRadius: '12px',
                padding: '6px 14px',
                backgroundColor: '#f8fafc'
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--jpay-text-main)', paddingRight: '10px', borderRight: '1px solid var(--jpay-border)' }}>
                  🇮🇩 +62
                </span>
                <input
                  type="tel"
                  value={phone.replace(/^0+/, '')}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  placeholder="81234567890"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    padding: '8px 10px',
                    backgroundColor: 'transparent',
                    color: 'var(--jpay-text-main)',
                    letterSpacing: '0.5px'
                  }}
                />
              </div>
              {/* Quick Select Registered Accounts */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {REGISTERED_USERS.slice(0, 4).map((u) => {
                  const isSelected = normalizePhone(phone) === normalizePhone(u.phone);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setError(null);
                        setPhone(u.phone);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid var(--jpay-primary)' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#e0f2fe' : '#f8fafc',
                        color: isSelected ? '#0284c7' : '#475569',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {u.name} ({u.phone})
                    </button>
                  );
                })}
              </div>
            </div>
            {error && (
              <div style={{ fontSize: '0.76rem', color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px 12px', borderRadius: '10px', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePhoneProceed}
              style={{
                backgroundColor: 'var(--jpay-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Lanjutkan
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <div style={{ fontSize: '0.84rem', color: 'var(--jpay-text-muted)', fontWeight: 600 }}>
              Akun: <strong style={{ color: 'var(--jpay-text-main)' }}>+62 {phone.startsWith('0') ? phone.slice(1) : phone}</strong>
            </div>

            {/* 6 Dots PIN Indicator */}
            <div style={{ display: 'flex', gap: '16px', margin: '14px 0' }}>
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: isFilled ? 'var(--jpay-primary)' : '#e2e8f0',
                      transform: isFilled ? 'scale(1.18)' : 'scale(1)',
                      transition: 'all 0.12s ease'
                    }}
                  />
                );
              })}
            </div>

            {error && (
              <div style={{ fontSize: '0.76rem', color: '#ef4444', backgroundColor: '#fef2f2', padding: '8px 14px', borderRadius: '8px', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => { setError(null); setStep('phone'); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--jpay-primary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              Ganti Nomor Handphone
            </button>
          </div>
        )}
      </div>

      {/* Mobile System Numeric Keyboard (Image #2) */}
      <MobileNumericKeyboard
        onDigit={handleDigit}
        onBackspace={handleBackspace}
        onSubmit={() => {
          if (step === 'phone') {
            handlePhoneProceed();
          } else if (pinRef.current.length === 6) {
            verifyPin(pinRef.current);
          }
        }}
      />
    </div>
  );
};
