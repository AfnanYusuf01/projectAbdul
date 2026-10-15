import React, { useState } from 'react';
import { REGISTERED_USERS, loadGeneratedVAList } from './UserWalletStore';
import { MobileNumericKeyboard } from './MobileNumericKeyboard';

interface UserVATransferProps {
  onBack: () => void;
  onConfirmVAPayment: (bankName: string, vaNumber: string, amount: number, recipientName: string) => void;
  currentUserPhone?: string;
}

export const UserVATransfer: React.FC<UserVATransferProps> = ({
  onBack,
  onConfirmVAPayment,
  currentUserPhone = ''
}) => {
  const generatedVAs = loadGeneratedVAList().map((g) => ({
    bank: g.bankName,
    va: g.vaNumber,
    name: g.targetUser.split(' — ')[0],
    amount: g.amount
  }));

  const userVAs = REGISTERED_USERS.filter((u) => u.phone !== currentUserPhone).map((u) => {
    const prefix = u.defaultBank === 'SeaBank' ? '8808' : u.defaultBank === 'BANK MANDIRI' ? '8902' : u.defaultBank === 'BCA' ? '1098' : '1289';
    return {
      bank: u.defaultBank,
      va: prefix + u.account.padEnd(12, '0').slice(0, 12),
      name: u.name,
      amount: 75000
    };
  });

  const ALL_KNOWN_VAS = [...generatedVAs, ...userVAs];

  const [bankName, setBankName] = useState('SeaBank');
  const [vaNumber, setVaNumber] = useState('');
  const [amount, setAmount] = useState('75000');
  const [recipientName, setRecipientName] = useState('Luciana Chen');

  const applyVaNumber = (nextVa: string) => {
    const cleanVa = nextVa.replace(/\D/g, '').slice(0, 18);
    setVaNumber(cleanVa);
    const matched = ALL_KNOWN_VAS.find((p) => p.va === cleanVa);
    if (matched) {
      setBankName(matched.bank);
      setRecipientName(matched.name);
      setAmount(matched.amount.toString());
    } else if (cleanVa.startsWith('8808')) {
      setBankName('SeaBank');
    } else if (cleanVa.startsWith('8902')) {
      setBankName('BANK MANDIRI');
    } else if (cleanVa.startsWith('1098')) {
      setBankName('BCA');
    } else if (cleanVa.startsWith('1289')) {
      setBankName('BRI');
    }
  };

  const handleSubmit = () => {
    if (!vaNumber || vaNumber.length < 8) {
      alert('Masukkan nomor Virtual Account yang valid.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Masukkan nominal pembayaran yang valid.');
      return;
    }
    onConfirmVAPayment(bankName, vaNumber, parsedAmount, recipientName);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {/* 1. Top Bar (Image #4) */}
      <div className="jpay-screen-header">
        <button className="jpay-header-back-btn" onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="jpay-screen-title">Ke Virtual Account {bankName}</span>
        <div style={{ width: '28px' }} />
      </div>

      {/* 2. Form Area (Image #4) */}
      <div style={{ flex: 1, padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        {/* Bank Logo & Label Card (Image #4) */}
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
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: bankName === 'SeaBank' ? '#ea580c' : bankName === 'BANK MANDIRI' ? '#003d79' : '#0060af',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '0.95rem',
            flexShrink: 0
          }}>
            {bankName === 'SeaBank' ? 'S' : bankName === 'BANK MANDIRI' ? 'M' : 'BCA'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>
              {bankName}
            </div>
          </div>
        </div>

        {/* VA Number Input Field (Image #4) */}
        <div>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid var(--jpay-border)',
            borderRadius: '12px',
            padding: '10px 14px',
            minHeight: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <input
              type="text"
              value={vaNumber}
              onChange={(e) => applyVaNumber(e.target.value)}
              placeholder="Masukkan nomor Virtual Account/nama"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--jpay-text-main)'
              }}
            />
            {vaNumber && (
              <button 
                type="button"
                onClick={() => setVaNumber('')}
                style={{ background: 'none', border: 'none', color: 'var(--jpay-text-muted)', cursor: 'pointer', padding: '4px', fontWeight: 800 }}
              >
                ✕
              </button>
            )}
          </div>

          {vaNumber.length >= 10 && (
            <div style={{
              marginTop: '10px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 800, color: '#166534' }}>{recipientName}</div>
                <div style={{ fontSize: '0.7rem', color: '#15803d' }}>Tagihan Virtual Account {bankName}</div>
              </div>
              <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#166534' }}>
                Rp {parseFloat(amount || '0').toLocaleString('id-ID')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Mobile System Numeric Keyboard (Image #2 & #4) */}
      <MobileNumericKeyboard
        onDigit={(d) => applyVaNumber(vaNumber + d)}
        onBackspace={() => applyVaNumber(vaNumber.slice(0, -1))}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
