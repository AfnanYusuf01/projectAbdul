import React, { useState, useRef } from 'react';
import { MobileNumericKeyboard } from './MobileNumericKeyboard';

interface UserPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  amount: number;
  recipientName: string;
}

export const UserPinModal: React.FC<UserPinModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  recipientName
}) => {
  const [pin, setPin] = useState('');
  const pinRef = useRef('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setError(null);
    if (pinRef.current.length >= 6) return;
    const next = pinRef.current + digit;
    pinRef.current = next;
    setPin(next);
    if (next.length === 6) {
      pinRef.current = '';
      setPin('');
      if (next === '123456') {
        onConfirm(next);
      } else {
        setError('PIN keamanan salah. Silakan coba kembali.');
      }
    }
  };

  const handleBackspace = () => {
    setError(null);
    pinRef.current = pinRef.current.slice(0, -1);
    setPin(pinRef.current);
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(4px)',
      zIndex: 500,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        {/* Header with Close */}
        <div style={{ width: '100%', padding: '0 20px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>
            Masukkan PIN J-Pay
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Transaction Summary */}
        <div style={{ width: 'calc(100% - 40px)', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--jpay-border)', textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--jpay-text-muted)' }}>Pembayaran ke {recipientName}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--jpay-primary)', marginTop: '2px' }}>
            Rp {amount.toLocaleString('id-ID')}
          </div>
        </div>

        {/* 6 Dots PIN */}
        <div style={{ display: 'flex', gap: '16px', margin: '10px 0 8px 0' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                backgroundColor: pin.length > i ? 'var(--jpay-primary)' : '#e2e8f0',
                transform: pin.length > i ? 'scale(1.18)' : 'scale(1)',
                transition: 'all 0.12s ease'
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Mobile System Numeric Keyboard (Image #2) */}
        <MobileNumericKeyboard
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onSubmit={() => {
            if (pinRef.current.length === 6 && pinRef.current === '123456') {
              onConfirm(pinRef.current);
            }
          }}
        />
      </div>
    </div>
  );
};
