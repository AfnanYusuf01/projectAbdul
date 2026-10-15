import React, { useState } from 'react';
import type { UserTransactionItem } from './UserTypes';

interface UserHistoryProps {
  transactions: UserTransactionItem[];
  onBack: () => void;
  onSelectTransaction: (tx: UserTransactionItem) => void;
  onOpenGenerateQRIS: () => void;
}

export const UserHistory: React.FC<UserHistoryProps> = ({
  transactions,
  onBack,
  onSelectTransaction,
  onOpenGenerateQRIS
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery);

    if (filterType === 'in') return matchesSearch && tx.type === 'in';
    if (filterType === 'out') return matchesSearch && tx.type === 'out';
    return matchesSearch;
  });

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {/* 1. Top Bar (Image #2) */}
      <div className="jpay-screen-header">
        <button className="jpay-header-back-btn" onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="jpay-screen-title">Aktivitas</span>
        <button 
          className="jpay-header-back-btn" 
          onClick={() => alert('Mengunduh e-Statement Rekening Koran (Format PDF)...')} 
          title="Unduh Rekening Koran"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* 2. Scrollable Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 80px 16px' }}>
        {/* Search Bar (Image #2) */}
        <div className="jpay-history-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--jpay-primary)' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="jpay-history-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, penerima, atau nominal..."
          />
          <button 
            onClick={() => setFilterType(prev => prev === 'all' ? 'out' : prev === 'out' ? 'in' : 'all')}
            style={{ background: 'none', border: 'none', color: filterType !== 'all' ? 'var(--jpay-primary)' : 'var(--jpay-text-muted)', cursor: 'pointer', padding: '2px' }}
            title="Filter Mutasi Masuk / Keluar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </div>

        {/* Bikin QRIS usahamu Promo Banner (Image #2) */}
        <div className="jpay-qris-promo-banner" onClick={onOpenGenerateQRIS}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#fff7ed',
            border: '1.5px solid #ffedd5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ea580c',
            fontWeight: 900,
            fontSize: '0.8rem',
            flexShrink: 0
          }}>
            QRIS
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>
              Bikin QRIS usahamu. GRATIS!
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--jpay-text-muted)', lineHeight: 1.3 }}>
              Isi nama usaha & nominal, lalu terima uang dari semua e-wallet!
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--jpay-primary)' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* Section Header: Bulan Ini & Statement > (Image #2) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 2px 10px 2px' }}>
          <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>
            Bulan Ini
          </span>
          <button
            onClick={() => alert('Membuka Laporan e-Statement Bulanan...')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--jpay-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>Statement</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Transaction History Items List (Image #2) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--jpay-text-muted)', fontSize: '0.85rem' }}>
              Tidak ada catatan aktivitas transaksi yang cocok.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isOut = tx.type === 'out';
              return (
                <div 
                  key={tx.id} 
                  className="jpay-history-item"
                  onClick={() => onSelectTransaction(tx)}
                  title="Klik untuk melihat bukti transaksi"
                >
                  {/* Left Circle Icon */}
                  <div className={`jpay-history-icon ${isOut ? 'out' : 'in'}`}>
                    {isOut ? (
                      /* Outgoing Transfer Icon (Image #2) */
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <polyline points="17 11 19 13 23 9" />
                      </svg>
                    ) : (
                      /* Top Up Plus Icon (Image #2) */
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </div>

                  {/* Middle Info */}
                  <div className="jpay-history-main">
                    <div className="jpay-history-title">
                      {tx.title}
                    </div>
                    <div className="jpay-history-date">
                      {tx.displayDate}
                    </div>
                  </div>

                  {/* Right Amount & Channel Badge (Image #2) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div className={`jpay-history-amount ${isOut ? 'out' : 'in'}`}>
                      {isOut ? `-Rp${tx.amount.toLocaleString('id-ID')}` : `Rp${tx.amount.toLocaleString('id-ID')}`}
                    </div>
                    {/* Channel Tag Badge */}
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: isOut ? '#e0f2fe' : '#dcfce7',
                      color: isOut ? '#0284c7' : '#166534',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {tx.channel}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
