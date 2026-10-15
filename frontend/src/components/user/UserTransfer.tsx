import React, { useState } from 'react';
import type { RecentRecipient } from './UserTypes';
import { REGISTERED_USERS } from './UserWalletStore';

interface UserTransferProps {
  onBack: () => void;
  onInitiateTransfer: (recipientName: string, bankName: string, accountNumber: string, amount: number, notes: string) => void;
  balance: number;
  currentUserPhone?: string;
}

export const UserTransfer: React.FC<UserTransferProps> = ({
  onBack,
  onInitiateTransfer,
  balance: _balance,
  currentUserPhone = ''
}) => {
  const colors = ['#ea580c', '#0284c7', '#0d9488', '#7c3aed'];
  const RECENT_RECIPIENTS: RecentRecipient[] = REGISTERED_USERS
    .filter((u) => u.phone !== currentUserPhone)
    .map((u, idx) => ({
      id: u.id,
      name: u.name,
      bankName: u.defaultBank,
      accountNumber: u.account,
      avatarLetter: u.name.slice(0, 2).toUpperCase(),
      color: colors[idx % colors.length]
    }));

  const [selectedBank, setSelectedBank] = useState(() => RECENT_RECIPIENTS[0]?.bankName || 'BCA');
  const [accountNumber, setAccountNumber] = useState(() => RECENT_RECIPIENTS[0]?.accountNumber || '522039182300');
  const [recipientName, setRecipientName] = useState(() => RECENT_RECIPIENTS[0]?.name || 'Luciana Chen');
  const [amount, setAmount] = useState('500000');
  const [notes, setNotes] = useState('Transfer antar pengguna J-Pay');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const BANKS = [
    { name: 'BANK MANDIRI', color: '#003d79', letter: 'M' },
    { name: 'BCA', color: '#0060af', letter: 'BCA' },
    { name: 'BRI', color: '#00529c', letter: 'BRI' },
    { name: 'SeaBank', color: '#ea580c', letter: 'S' },
    { name: 'Sesama J-Pay', color: '#0284c7', letter: 'J' }
  ];
  const handleSelectRecipient = (r: RecentRecipient) => {
    setSelectedBank(r.bankName);
    setAccountNumber(r.accountNumber);
    setRecipientName(r.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!accountNumber || accountNumber.length < 6) {
      alert('Masukkan nomor rekening yang valid.');
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Masukkan nominal transfer yang valid.');
      return;
    }
    onInitiateTransfer(recipientName, selectedBank, accountNumber, parsedAmount, notes);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {/* 1. Top Bar (Image #5) */}
      <div className="jpay-screen-header">
        <button className="jpay-header-back-btn" onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="jpay-screen-title">Ke {selectedBank}</span>
        <div style={{ width: '28px' }} />
      </div>

      {/* 2. Scrollable Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Bank Card (Image #5) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 14px',
          backgroundColor: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid var(--jpay-border)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: BANKS.find(b => b.name === selectedBank)?.color || '#0284c7',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '0.82rem',
            flexShrink: 0
          }}>
            {BANKS.find(b => b.name === selectedBank)?.letter || 'BANK'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>
              {selectedBank}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--jpay-text-muted)' }}>
              Transfer Antarbank Realtime (BI-FAST & Online)
            </div>
          </div>
        </div>

        {/* Bank Switcher Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {BANKS.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => setSelectedBank(b.name)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: selectedBank === b.name ? '1.5px solid var(--jpay-primary)' : '1px solid var(--jpay-border)',
                backgroundColor: selectedBank === b.name ? '#e0f2fe' : '#ffffff',
                color: selectedBank === b.name ? 'var(--jpay-primary)' : 'var(--jpay-text-main)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Custom UI Dropdown Penerima Terdaftar */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--jpay-text-muted)', marginBottom: '6px', display: 'block' }}>
            Pilih Nasabah Penerima Terdaftar
          </label>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            style={{
              width: '100%',
              backgroundColor: '#f8fafc',
              border: isDropdownOpen ? '2px solid var(--jpay-primary)' : '1.5px solid var(--jpay-border)',
              borderRadius: '14px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
              boxSizing: 'border-box'
            }}
          >
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>
                {recipientName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--jpay-text-muted)' }}>
                {selectedBank} • Rek: {accountNumber}
              </div>
            </div>
            <span style={{ color: 'var(--jpay-primary)', fontWeight: 800 }}>
              {isDropdownOpen ? '▴' : '▾'}
            </span>
          </button>

          {isDropdownOpen && (
            <div style={{
              marginTop: '6px',
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '14px',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14)',
              overflow: 'hidden'
            }}>
              {RECENT_RECIPIENTS.map((r) => {
                const isSelected = r.accountNumber === accountNumber;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      handleSelectRecipient(r);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#0284c7' : 'var(--jpay-text-main)' }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--jpay-text-muted)' }}>
                        {r.bankName} • {r.accountNumber}
                      </div>
                    </div>
                    {isSelected && <span style={{ color: '#0284c7', fontWeight: 900 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Nominal Field */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--jpay-text-muted)', marginBottom: '6px', display: 'block' }}>
            Nominal Transfer (Rp)
          </label>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid var(--jpay-border)',
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: 800, color: 'var(--jpay-text-muted)', fontSize: '0.95rem' }}>Rp</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--jpay-text-main)'
              }}
            />
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--jpay-text-muted)', marginBottom: '6px', display: 'block' }}>
            Catatan (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis pesan transfer..."
            style={{
              width: '100%',
              backgroundColor: '#f8fafc',
              border: '1.5px solid var(--jpay-border)',
              borderRadius: '14px',
              padding: '10px 14px',
              boxSizing: 'border-box',
              outline: 'none',
              fontSize: '0.85rem',
              color: 'var(--jpay-text-main)'
            }}
          />
        </div>

        {/* Section: Terakhir / Recent Recipients (Image #5) */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--jpay-text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Terakhir
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {RECENT_RECIPIENTS.map((rec) => (
              <div
                key={rec.id}
                className="jpay-recent-item"
                onClick={() => handleSelectRecipient(rec)}
              >
                {/* Orange Avatar Circle (Image #5) */}
                <div className="jpay-recent-avatar" style={{ backgroundColor: rec.color }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--jpay-text-main)' }}>
                    {rec.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--jpay-text-muted)' }}>
                    {rec.bankName}: {rec.accountNumber}
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--jpay-primary)' }}>
                  Pilih
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Submit Button */}
      <div style={{ padding: '12px 18px 24px 18px', backgroundColor: '#ffffff', borderTop: '1px solid var(--jpay-border)' }}>
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            width: '100%',
            backgroundColor: 'var(--jpay-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '14px',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>Lanjutkan Transfer</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
