import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionDetailModal, TransactionDecryptModal } from './TransactionModals';
import { EyeIcon, LockIcon, UnlockIcon, SearchIcon, RefreshIcon, CalendarIcon, CopyIcon, CheckIcon } from './Icons';
import { downloadCSV } from '../utils';
import './TransactionDashboard.css';

interface TransactionsProps {
  transactions: Transaction[];
  onDecrypt: (id: number) => Promise<string>;
  role: string;
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDecrypt, role, onNotify }) => {
  // Filter States (Image 2 Filter Transaksi Card)
  const [filterTxId, setFilterTxId] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPayload, setFilterPayload] = useState('ALL');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [dateRange] = useState('10/10/2026 - 10/10/2026');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(true);

  // View Mode & Selection States
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals States
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [decryptTx, setDecryptTx] = useState<Transaction | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [loadingDecrypt, setLoadingDecrypt] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const handleExportTransactions = () => {
    const headers = ['Waktu', 'ID Transaksi', 'Nasabah Pengirim', 'User Tujuan', 'Rekening Tujuan', 'Nominal (Rp)', 'Channel', 'Status'];
    const rows = filteredTxs.map(t => [
      new Date(t.timestamp).toLocaleString('id-ID'),
      t.transaction_id,
      t.customer_id,
      t.recipient_name || '-',
      t.recipient_account || '-',
      t.amount,
      t.channel,
      t.status
    ]);
    downloadCSV(`jatelindo_transaksi_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    onNotify?.('success', 'Ekspor Data Berhasil!', `Sebanyak ${filteredTxs.length} baris data transaksi berhasil diunduh.`);
  };
  // Database Counts
  const totalCount = transactions.length || 84;
  const safeCount = useMemo(() => transactions.filter(t => t.status === 'SUCCESS').length || 55, [transactions]);
  const suspiciousCount = useMemo(() => transactions.filter(t => t.status === 'SUSPICIOUS').length || 29, [transactions]);
  const safePct = ((safeCount / (totalCount || 1)) * 100).toFixed(1);
  const suspPct = ((suspiciousCount / (totalCount || 1)) * 100).toFixed(1);

  // Available distinct channels
  const availableChannels = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.channel) set.add(t.channel);
    });
    return Array.from(set);
  }, [transactions]);

  const resetAllFilters = () => {
    setFilterTxId('');
    setFilterCustomer('');
    setFilterChannel('ALL');
    setFilterStatus('ALL');
    setFilterPayload('ALL');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setCurrentPage(1);
  };

  // Filtered Transactions
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      if (filterTxId.trim() && !tx.transaction_id.toLowerCase().includes(filterTxId.toLowerCase())) return false;
      if (filterCustomer.trim()) {
        const query = filterCustomer.toLowerCase();
        const matchCustomer = tx.customer_id.toLowerCase().includes(query);
        const matchRecipient = tx.recipient_name?.toLowerCase().includes(query);
        if (!matchCustomer && !matchRecipient) return false;
      }
      if (filterChannel !== 'ALL' && tx.channel !== filterChannel) return false;
      if (filterStatus !== 'ALL' && tx.status !== filterStatus) return false;
      if (filterMinAmount !== '') {
        const min = parseFloat(filterMinAmount);
        if (!isNaN(min) && tx.amount < min) return false;
      }
      if (filterMaxAmount !== '') {
        const max = parseFloat(filterMaxAmount);
        if (!isNaN(max) && tx.amount > max) return false;
      }
      return true;
    });
  }, [transactions, filterTxId, filterCustomer, filterChannel, filterStatus, filterMinAmount, filterMaxAmount]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredTxs.length / pageSize) || 1;
  const paginatedTxs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTxs.slice(start, start + pageSize);
  }, [filteredTxs, currentPage, pageSize]);

  const handleToggleSelectAll = () => {
    if (selectedIds.size === paginatedTxs.length && paginatedTxs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTxs.map(t => t.id)));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCopyPayload = (id: number, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenDecrypt = async (tx: Transaction) => {
    setDecryptTx(tx);
    setDecryptedText(null);
    setDecryptError(null);
    setLoadingDecrypt(true);
    try {
      const plaintext = await onDecrypt(tx.id);
      setDecryptedText(plaintext);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendekripsi payload transaksi.';
      setDecryptError(msg);
    } finally {
      setLoadingDecrypt(false);
    }
  };

  const getChannelBadge = (channel: string) => {
    const ch = (channel || '').toLowerCase();
    if (ch.includes('virtual') || ch.includes('va')) return <span className="jt-badge-channel va">Virtual Account</span>;
    if (ch.includes('wallet')) return <span className="jt-badge-channel wallet">E-Wallet</span>;
    if (ch.includes('qris')) return <span className="jt-badge-channel qris">QRIS</span>;
    return <span className="jt-badge-channel card">Credit Card</span>;
  };

  return (
    <div className="view-container animate-fade-in" style={{ padding: '20px 32px 32px' }}>
      {/* BREADCRUMB & PAGE HEADER (IMAGE 2) */}
      <div className="jt-breadcrumb">
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </span>
        <span>Transaksi</span>
        <span>›</span>
        <span className="jt-breadcrumb-item active">Daftar Transaksi Masuk</span>
      </div>

      <div className="jt-header-row" style={{ marginTop: '4px', marginBottom: '18px' }}>
        <div>
          <h1 className="jt-header-title">Daftar Transaksi Masuk</h1>
          <p className="jt-header-subtitle">
            Pemantauan transaksi pembayaran elektronik real-time dengan enkripsi end-to-end (AES-256 + RSA-2048).
          </p>
        </div>

        <div className="jt-header-actions">
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '7px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
            Total di Database: {totalCount}
          </div>

          <button className="jt-btn-export" onClick={handleExportTransactions}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Data</span>
            <span style={{ fontSize: '0.72rem', marginLeft: '2px' }}>▾</span>
          </button>
        </div>
      </div>

      {/* ROW 1: 4 KPI CARDS WITH MINI VERTICAL BARS (IMAGE 2) */}
      <div className="jt-kpi-grid" style={{ marginBottom: '20px' }}>
        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{totalCount}</span>
            </div>
            <span className="jt-kpi-label">Total Transaksi</span>
            <div className="jt-kpi-trend green">
              <span>↑ +12% dari periode sebelumnya</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="jt-kpi-iconbox blue" style={{ width: '36px', height: '36px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="jt-mini-bars">
              <div className="jt-mini-bar" style={{ height: '14px', backgroundColor: '#3b82f6' }}></div>
              <div className="jt-mini-bar" style={{ height: '22px', backgroundColor: '#3b82f6' }}></div>
              <div className="jt-mini-bar" style={{ height: '18px', backgroundColor: '#3b82f6' }}></div>
              <div className="jt-mini-bar" style={{ height: '28px', backgroundColor: '#3b82f6' }}></div>
              <div className="jt-mini-bar" style={{ height: '24px', backgroundColor: '#3b82f6' }}></div>
            </div>
          </div>
        </div>

        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{safeCount}</span>
            </div>
            <span className="jt-kpi-label">Transaksi Aman</span>
            <div className="jt-kpi-trend green">
              <span>{safePct}% dari total</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="jt-kpi-iconbox green" style={{ width: '36px', height: '36px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div className="jt-mini-bars">
              <div className="jt-mini-bar" style={{ height: '18px', backgroundColor: '#10b981' }}></div>
              <div className="jt-mini-bar" style={{ height: '24px', backgroundColor: '#10b981' }}></div>
              <div className="jt-mini-bar" style={{ height: '20px', backgroundColor: '#10b981' }}></div>
              <div className="jt-mini-bar" style={{ height: '30px', backgroundColor: '#10b981' }}></div>
              <div className="jt-mini-bar" style={{ height: '26px', backgroundColor: '#10b981' }}></div>
            </div>
          </div>
        </div>

        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{suspiciousCount}</span>
            </div>
            <span className="jt-kpi-label">Transaksi Mencurigakan</span>
            <div className="jt-kpi-trend red">
              <span>{suspPct}% dari total</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="jt-kpi-iconbox red" style={{ width: '36px', height: '36px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="jt-mini-bars">
              <div className="jt-mini-bar" style={{ height: '10px', backgroundColor: '#ef4444' }}></div>
              <div className="jt-mini-bar" style={{ height: '16px', backgroundColor: '#ef4444' }}></div>
              <div className="jt-mini-bar" style={{ height: '12px', backgroundColor: '#ef4444' }}></div>
              <div className="jt-mini-bar" style={{ height: '22px', backgroundColor: '#ef4444' }}></div>
              <div className="jt-mini-bar" style={{ height: '18px', backgroundColor: '#ef4444' }}></div>
            </div>
          </div>
        </div>

        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">2.8 detik</span>
            </div>
            <span className="jt-kpi-label">Rata-rata Enkripsi</span>
            <div className="jt-kpi-trend green">
              <span>↓ -18% dari periode sebelumnya</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="jt-kpi-iconbox blue" style={{ width: '36px', height: '36px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="jt-mini-bars">
              <div className="jt-mini-bar" style={{ height: '16px', backgroundColor: '#06b6d4' }}></div>
              <div className="jt-mini-bar" style={{ height: '12px', backgroundColor: '#06b6d4' }}></div>
              <div className="jt-mini-bar" style={{ height: '20px', backgroundColor: '#06b6d4' }}></div>
              <div className="jt-mini-bar" style={{ height: '14px', backgroundColor: '#06b6d4' }}></div>
              <div className="jt-mini-bar" style={{ height: '25px', backgroundColor: '#06b6d4' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: FILTER TRANSAKSI CARD (IMAGE 2) */}
      <div className="jt-filter-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filter Transaksi</span>
          </div>

          <div 
            onClick={resetAllFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
          >
            <RefreshIcon size={12} />
            <span>Reset Filter</span>
          </div>
        </div>

        <div className="jt-filter-grid-row1">
          <div className="jt-filter-field">
            <label className="jt-filter-label">Periode Waktu</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px', backgroundColor: 'var(--bg-surface)' }}>
              <CalendarIcon size={14} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{dateRange}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex' }}><RefreshIcon size={12} /></span>
            </div>
          </div>

          <div className="jt-filter-field">
            <label className="jt-filter-label">ID Transaksi</label>
            <input
              type="text"
              className="jt-filter-input"
              placeholder="Cari ID transaksi..."
              value={filterTxId}
              onChange={(e) => setFilterTxId(e.target.value)}
            />
          </div>

          <div className="jt-filter-field">
            <label className="jt-filter-label">Nasabah / Pelanggan</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="jt-filter-input"
                placeholder="Cari nama nasabah..."
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                style={{ paddingRight: '30px' }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <SearchIcon size={14} />
              </span>
            </div>
          </div>

          <div className="jt-filter-field">
            <label className="jt-filter-label">Nominal (Rp)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                className="jt-filter-input"
                placeholder="Min"
                value={filterMinAmount}
                onChange={(e) => setFilterMinAmount(e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                className="jt-filter-input"
                placeholder="Max"
                value={filterMaxAmount}
                onChange={(e) => setFilterMaxAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="jt-filter-field">
            <label className="jt-filter-label">Channel</label>
            <select
              className="jt-filter-select"
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
            >
              <option value="ALL">Semua Channel</option>
              {availableChannels.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>
        </div>

        {showAdvancedFilter && (
          <div className="jt-filter-grid-row2">
            <div className="jt-filter-field">
              <label className="jt-filter-label">Status</label>
              <select
                className="jt-filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">Semua Status</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="SUSPICIOUS">SUSPICIOUS</option>
              </select>
            </div>

            <div className="jt-filter-field">
              <label className="jt-filter-label">Payload Terenkripsi</label>
              <select
                className="jt-filter-select"
                value={filterPayload}
                onChange={(e) => setFilterPayload(e.target.value)}
              >
                <option value="ALL">AES-256 (DB)</option>
              </select>
            </div>

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', paddingBottom: '10px' }}
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            >
              <span>⚙ Filter Lanjutan</span>
              <span>^</span>
            </div>

            <div>
              <button 
                className="jt-btn-apply-filter" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => setCurrentPage(1)}
              >
                <SearchIcon size={14} />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ROW 3: HASIL TRANSAKSI TABLE CARD (IMAGE 2) */}
      <div className="jt-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Hasil Transaksi ({filteredTxs.length} data)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>Terakhir diperbarui: 10 Okt 2026, 15:44:54</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="jt-view-switcher">
              <button 
                className={`jt-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <span>▦</span>
                <span>Tabel</span>
              </button>
              <button 
                className={`jt-view-btn ${viewMode === 'compact' ? 'active' : ''}`}
                onClick={() => setViewMode('compact')}
              >
                <span>☰</span>
                <span>Ringkas</span>
              </button>
            </div>

            <button className="jt-btn-filter-pill" style={{ padding: '6px 12px' }}>
              <span>▥</span>
              <span>Kolom</span>
              <span style={{ fontSize: '0.7rem' }}>▾</span>
            </button>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === paginatedTxs.length && paginatedTxs.length > 0}
                    onChange={handleToggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ width: '150px' }}>
                  <span>WAKTU</span>
                  <span style={{ marginLeft: '4px', fontSize: '0.72rem' }}>↓</span>
                </th>
                <th style={{ width: '200px' }}>ID TRANSAKSI</th>
                <th style={{ width: '180px' }}>PENGIRIM & TUJUAN</th>
                <th style={{ width: '140px' }}>NOMINAL</th>
                <th style={{ width: '130px' }}>CHANNEL</th>
                <th style={{ width: '180px' }}>PAYLOAD TERENKRIPSI</th>
                <th style={{ width: '120px' }}>STATUS</th>
                <th style={{ width: '100px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTxs.map((tx) => {
                const dateObj = new Date(tx.timestamp);
                const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID') : '10/10/2026';
                const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString('id-ID') : '15:44:54';
                const isSelected = selectedIds.has(tx.id);
                const isCopied = copiedId === tx.id;
                const isSuspicious = tx.status === 'SUSPICIOUS';

                return (
                  <tr key={tx.id} style={isSelected ? { backgroundColor: 'rgba(37, 99, 235, 0.04)' } : {}}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(tx.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{dateStr}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeStr}</div>
                      </div>
                    </td>
                    <td>
                      <span 
                        style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                        onClick={() => setSelectedTx(tx)}
                      >
                        #{tx.transaction_id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          {tx.customer_id}
                        </div>
                        {tx.recipient_name ? (
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <span>➔ Ke:</span>
                            <span title={tx.recipient_account ? `Rek: ${tx.recipient_account}` : ''}>{tx.recipient_name}</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            ID Pelanggan
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        Rp {tx.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td>
                      {getChannelBadge(tx.channel)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span 
                          className="mono-text" 
                          style={{ fontSize: '0.74rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}
                          title={tx.encrypted_payload}
                        >
                          {tx.encrypted_payload.slice(0, 16)}...
                        </span>
                        <button 
                          className="jt-copy-btn"
                          onClick={() => handleCopyPayload(tx.id, tx.encrypted_payload)}
                          title={isCopied ? "Tersalin!" : "Salin Hash Payload"}
                        >
                          {isCopied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isSuspicious ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.74rem', padding: '3px 8px' }}>
                        ● {tx.status}
                      </span>
                    </td>
                    <td>
                      <div className="jt-table-actions-cell">
                        <button 
                          className="jt-action-icon-btn"
                          onClick={() => setSelectedTx(tx)}
                          title="Lihat Detail Transaksi"
                        >
                          <EyeIcon size={14} />
                        </button>
                        <button 
                          className="jt-action-icon-btn"
                          onClick={() => handleOpenDecrypt(tx)}
                          disabled={role !== 'FraudAnalyst' && role !== 'SecurityAdmin'}
                          title={role !== 'FraudAnalyst' && role !== 'SecurityAdmin' ? "Hanya Super Admin & Fraud Analyst yang memiliki akses dekripsi" : "Dekripsi Payload"}
                        >
                          {role !== 'FraudAnalyst' && role !== 'SecurityAdmin' ? <LockIcon size={14} /> : <UnlockIcon size={14} />}
                        </button>
                        <button 
                          className="jt-action-icon-btn"
                          style={{ border: 'none', background: 'transparent' }}
                          title="Opsi Lanjutan"
                        >
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Page Size Select & Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="pagination-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, filteredTxs.length)} - {Math.min(currentPage * pageSize, filteredTxs.length)} dari {filteredTxs.length} data
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>
              1
            </button>
            {totalPages >= 2 && (
              <button className={`pagination-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>
                2
              </button>
            )}
            {totalPages >= 3 && (
              <button className={`pagination-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>
                3
              </button>
            )}
            {totalPages >= 4 && (
              <button className={`pagination-btn ${currentPage === 4 ? 'active' : ''}`} onClick={() => setCurrentPage(4)}>
                4
              </button>
            )}
            {totalPages >= 5 && (
              <button className={`pagination-btn ${currentPage === 5 ? 'active' : ''}`} onClick={() => setCurrentPage(5)}>
                5
              </button>
            )}
            {totalPages > 6 && (
              <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>
            )}
            {totalPages > 5 && (
              <button className={`pagination-btn ${currentPage === totalPages ? 'active' : ''}`} onClick={() => setCurrentPage(totalPages)}>
                {totalPages}
              </button>
            )}
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <TransactionDetailModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
          onOpenDecrypt={handleOpenDecrypt}
          onDecrypt={onDecrypt}
          role={role}
        />
      )}

      {/* Decrypt Payload Modal */}
      {decryptTx && (
        <TransactionDecryptModal
          tx={decryptTx}
          onClose={() => setDecryptTx(null)}
          decryptedText={decryptedText}
          loadingDecrypt={loadingDecrypt}
          decryptError={decryptError}
        />
      )}
    </div>
  );
};
