import React, { useState, useMemo } from 'react';
import type { Transaction, FraudAlert } from '../types';
import { REGISTERED_USERS, loadFullLedger } from './user/UserWalletStore';
import type { RegisteredRecipientInfo } from './user/UserWalletStore';
import {
  EyeIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CloseIcon,
  BankIcon,
  CopyIcon,
  CheckIcon
} from './Icons';
import { downloadCSV } from '../utils';
import './TransactionDashboard.css';

interface UserManagementProps {
  transactions: Transaction[];
  alerts: FraudAlert[];
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
}

interface EnrichedUserRecord extends RegisteredRecipientInfo {
  currentBalance: number;
  txCount: number;
  safeTxCount: number;
  suspiciousTxCount: number;
  totalVolume: number;
  alertCount: number;
  riskStatus: 'SAFE' | 'WATCH';
}

export const UserManagement: React.FC<UserManagementProps> = ({
  transactions,
  alerts,
  onNotify
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<EnrichedUserRecord | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const ledger = useMemo(() => loadFullLedger(), [transactions]);

  // Enrich all 120 users with real database transactions, alerts, and wallet balances
  const enrichedUsers = useMemo<EnrichedUserRecord[]>(() => {
    return REGISTERED_USERS.map((u) => {
      const wallet = ledger[u.phone];
      const currentBalance = wallet ? wallet.balance : u.initialBalance;

      const userDbTxs = transactions.filter(
        (t) =>
          t.customer_id === u.id ||
          t.customer_id.toLowerCase() === u.name.toLowerCase()
      );

      const safeTxCount = userDbTxs.filter((t) => t.status === 'SUCCESS').length;
      const suspiciousTxCount = userDbTxs.filter((t) => t.status === 'SUSPICIOUS').length;
      const totalVolume = userDbTxs.reduce((acc, t) => acc + (t.amount || 0), 0);

      const userTxIds = new Set(userDbTxs.map((t) => t.transaction_id));
      const alertCount = alerts.filter((a) => userTxIds.has(a.transaction_id)).length;

      return {
        ...u,
        currentBalance,
        txCount: userDbTxs.length,
        safeTxCount,
        suspiciousTxCount,
        totalVolume,
        alertCount,
        riskStatus: suspiciousTxCount > 0 ? 'WATCH' : 'SAFE'
      };
    });
  }, [transactions, alerts, ledger]);

  // Summary KPIs across all 120 users
  const totalUsersCount = enrichedUsers.length;
  const totalBalanceAUM = useMemo(
    () => enrichedUsers.reduce((sum, u) => sum + u.currentBalance, 0),
    [enrichedUsers]
  );
  const activeTransactingUsers = useMemo(
    () => enrichedUsers.filter((u) => u.txCount > 0).length,
    [enrichedUsers]
  );
  const watchUsersCount = useMemo(
    () => enrichedUsers.filter((u) => u.riskStatus === 'WATCH').length,
    [enrichedUsers]
  );

  // Filtered users
  const filteredUsers = useMemo(() => {
    return enrichedUsers.filter((u) => {
      if (selectedBank !== 'ALL' && u.defaultBank !== selectedBank) return false;
      if (selectedRisk !== 'ALL' && u.riskStatus !== selectedRisk) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.account.includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [enrichedUsers, selectedBank, selectedRisk, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleCopyPhone = (phone: string, name: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
      onNotify?.('info', 'Nomor HP Disalin', `Nomor ponsel ${name} (${phone}) berhasil disalin.`);
    }
  };

  const handleExportUsersCSV = () => {
    const headers = [
      'No',
      'ID Nasabah',
      'Nama Lengkap',
      'Nomor Ponsel',
      'Email',
      'Kota Domisili',
      'Bank Utama',
      'Nomor Rekening',
      'Saldo Aktif (Rp)',
      'Total Transaksi DB',
      'Transaksi Aman',
      'Transaksi Mencurigakan',
      'Status KYC',
      'Tanggal Bergabung'
    ];
    const rows = enrichedUsers.map((u, idx) => [
      idx + 1,
      u.id,
      u.name,
      u.phone,
      u.email,
      u.city,
      u.defaultBank,
      u.account,
      u.currentBalance,
      u.txCount,
      u.safeTxCount,
      u.suspiciousTxCount,
      u.kycStatus,
      u.joinDate
    ]);
    downloadCSV(`jatelindo_daftar_120_user_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    onNotify?.('success', 'Ekspor 120 User Berhasil!', `Daftar lengkap ${enrichedUsers.length} user nasabah berhasil diunduh ke CSV.`);
  };

  const getBankBadgeClass = (bank: string) => {
    const b = bank.toUpperCase();
    if (b.includes('BCA')) return 'qris';
    if (b.includes('MANDIRI') || b.includes('BNI')) return 'va';
    if (b.includes('SEABANK') || b.includes('BSI')) return 'wallet';
    return 'card';
  };

  // Transactions for the currently selected user in the Detail Modal
  const selectedUserTransactions = useMemo(() => {
    if (!selectedUser) return [];
    const dbTxs = transactions
      .filter(
        (t) =>
          t.customer_id === selectedUser.id ||
          t.customer_id.toLowerCase() === selectedUser.name.toLowerCase()
      )
      .slice(0, 25)
      .map((t) => ({
        id: t.transaction_id,
        timestamp: new Date(t.timestamp).toLocaleString('id-ID'),
        channel: t.channel,
        amount: t.amount,
        status: t.status,
        source: 'Database SQLite'
      }));

    const walletTxs = (ledger[selectedUser.phone]?.transactions || []).map((wt) => ({
      id: wt.id,
      timestamp: wt.displayDate,
      channel: wt.channel,
      amount: wt.amount,
      status: wt.status,
      source: 'Dompet J-Pay'
    }));

    const seen = new Set<string>();
    const combined = [];
    for (const item of [...dbTxs, ...walletTxs]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    }
    return combined;
  }, [selectedUser, transactions, ledger]);

  return (
    <div className="view-container animate-fade-in" style={{ padding: '24px 32px' }}>
      {/* HEADER */}
      <div className="jt-header-row">
        <div className="jt-header-title-box">
          <div className="jt-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1 className="jt-header-title">Manajemen User & Nasabah</h1>
            <p className="jt-header-subtitle">
              Direktori lengkap {totalUsersCount} akun nasabah J-Pay terdaftar beserta nomor ponsel, rekening bank, saldo aktif, dan riwayat keamanan.
            </p>
          </div>
        </div>

        <div className="jt-header-actions">
          <button className="jt-btn-export" onClick={handleExportUsersCSV}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export 120 User (CSV)</span>
          </button>
        </div>
      </div>

      {/* 4 KPI SUMMARY CARDS */}
      <div className="jt-kpi-grid">
        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-top">
              <div className="jt-kpi-iconbox blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <span className="jt-kpi-label">Total User Terdaftar</span>
            </div>
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{totalUsersCount}</span>
            </div>
            <div className="jt-kpi-trend green">
              <span>✓ 100% KYC</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Nama & nomor unik</span>
            </div>
          </div>
          <svg className="jt-sparkline-svg" viewBox="0 0 100 40">
            <path d="M 0 30 Q 20 18 40 22 T 70 10 T 100 6" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-top">
              <div className="jt-kpi-iconbox green">
                <BankIcon size={20} />
              </div>
              <span className="jt-kpi-label">Total Saldo Nasabah</span>
            </div>
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value" style={{ fontSize: '1.45rem' }}>
                Rp {(totalBalanceAUM / 1000000).toFixed(1)} Jt
              </span>
            </div>
            <div className="jt-kpi-trend green">
              <span>Rp {totalBalanceAUM.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <svg className="jt-sparkline-svg" viewBox="0 0 100 40">
            <path d="M 0 32 Q 18 14 38 24 T 68 12 T 100 8" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-top">
              <div className="jt-kpi-iconbox orange">
                <CheckCircleIcon size={20} />
              </div>
              <span className="jt-kpi-label">User Aktif Transaksi DB</span>
            </div>
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{activeTransactingUsers}</span>
            </div>
            <div className="jt-kpi-trend green">
              <span>Terhubung ke SQLite</span>
            </div>
          </div>
          <svg className="jt-sparkline-svg" viewBox="0 0 100 40">
            <path d="M 0 26 Q 22 20 44 24 T 72 14 T 100 10" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-top">
              <div className="jt-kpi-iconbox red">
                <AlertTriangleIcon size={20} />
              </div>
              <span className="jt-kpi-label">Dalam Pengawasan Fraud</span>
            </div>
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{watchUsersCount}</span>
            </div>
            <div className="jt-kpi-trend red">
              <span>Pernah memicu alert</span>
            </div>
          </div>
          <svg className="jt-sparkline-svg" viewBox="0 0 100 40">
            <path d="M 0 24 Q 18 32 36 16 T 68 24 T 100 12" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* MAIN TABLE CARD (Matching Dashboard.tsx & Transactions.tsx) */}
      <div className="jt-card" style={{ padding: '22px 24px' }}>
        <div className="jt-table-header-row" style={{ marginBottom: '18px' }}>
          <div className="jt-card-title-group">
            <div className="jt-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Daftar Nasabah J-Pay ({filteredUsers.length} dari {totalUsersCount} User)</span>
            </div>
            <span className="jt-card-subtitle">
              Klik tombol <strong>Lihat Detail</strong> pada baris user untuk melihat profil lengkap, PIN, nomor rekening, dan riwayat transaksi.
            </span>
          </div>

          <div className="jt-table-controls" style={{ flexWrap: 'wrap' }}>
            {/* Search Input Pill */}
            <div className="jt-search-input-pill" style={{ width: '270px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama, nomor HP (08...), ID, kota..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Bank Filter */}
            <select
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
                setCurrentPage(1);
              }}
              className="pagination-select"
              style={{ height: '36px', padding: '0 12px', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <option value="ALL">Semua Bank (8 Bank)</option>
              <option value="BCA">BCA</option>
              <option value="BANK MANDIRI">BANK MANDIRI</option>
              <option value="BRI">BRI</option>
              <option value="BNI">BNI</option>
              <option value="SeaBank">SeaBank</option>
              <option value="BSI">BSI</option>
              <option value="CIMB Niaga">CIMB Niaga</option>
            </select>

            {/* Risk Status Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="pagination-select"
              style={{ height: '36px', padding: '0 12px', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <option value="ALL">Semua Status Keamanan</option>
              <option value="SAFE">Aman / Normal</option>
              <option value="WATCH">Pengawasan Fraud</option>
            </select>
          </div>
        </div>

        {/* ENTERPRISE TABLE (.custom-table from WillowViews.css) */}
        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '11%' }}>ID NASABAH</th>
                <th style={{ width: '24%' }}>NAMA & DOMISILI NASABAH</th>
                <th style={{ width: '16%' }}>NOMOR PONSEL</th>
                <th style={{ width: '15%' }}>BANK & REKENING</th>
                <th style={{ width: '12%' }}>SALDO AKTIF</th>
                <th style={{ width: '12%' }}>STATUS</th>
                <th style={{ width: '10%', textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const isCopied = copiedPhone === u.phone;
                const isSafe = u.riskStatus === 'SAFE';

                return (
                  <tr key={u.id}>
                    {/* 1. ID NASABAH */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{rowNum}</span>
                        <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => setSelectedUser(u)}>
                          {u.id}
                        </span>
                      </div>
                    </td>

                    {/* 2. NAMA & DOMISILI */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border-color)' }}
                        />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.83rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {u.city} • {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. NOMOR PONSEL (LOGIN) */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className="mono-text"
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#2563eb',
                            backgroundColor: 'var(--bg-subtle)',
                            padding: '4px 9px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {u.phone}
                        </span>
                        <button
                          type="button"
                          className="jt-copy-btn"
                          onClick={() => handleCopyPhone(u.phone, u.name)}
                          title={isCopied ? 'Tersalin!' : 'Salin Nomor HP'}
                        >
                          {isCopied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                        </button>
                      </div>
                    </td>

                    {/* 4. BANK & NO. REKENING */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                        <span className={`jt-badge-channel ${getBankBadgeClass(u.defaultBank)}`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                          <BankIcon size={11} />
                          <span>{u.defaultBank}</span>
                        </span>
                        <span className="mono-text" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {u.account}
                        </span>
                      </div>
                    </td>

                    {/* 5. SALDO AKTIF */}
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        Rp {u.currentBalance.toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* 6. STATUS & AKTIVITAS */}
                    <td>
                      <span className={`jt-badge-status ${isSafe ? 'berhasil' : 'mencurigakan'}`} style={{ whiteSpace: 'nowrap' }}>
                        {isSafe ? <CheckCircleIcon size={12} /> : <AlertTriangleIcon size={12} />}
                        <span>{isSafe ? `Aman (${u.txCount})` : `${u.suspiciousTxCount} Alert`}</span>
                      </span>
                    </td>

                    {/* 7. AKSI */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        style={{ padding: '5px 10px', fontSize: '0.73rem', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                        onClick={() => setSelectedUser(u)}
                      >
                        <EyeIcon size={13} />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada user nasabah yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER & PAGINATION (Matching Transactions.tsx) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            marginTop: '8px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
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
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)} - {Math.min(currentPage * pageSize, filteredUsers.length)} dari {filteredUsers.length} user terdaftar
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '760px', width: '94%', maxHeight: '88vh', overflowY: 'auto', padding: '26px 28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.22rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedUser.name}
                    </h3>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 9px', borderRadius: '8px' }}>
                      {selectedUser.id}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 9px', borderRadius: '8px' }}>
                      ✓ {selectedUser.kycStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    {selectedUser.email} • Domisili: <strong>{selectedUser.city}</strong> • Terdaftar: {selectedUser.joinDate}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* 2-Column Detail Cards: Kredensial Login & Rekening Bank */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Card A: Kredensial Login J-Pay Mobile */}
              <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                  📱 Kredensial Login Aplikasi J-Pay
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Nomor Handphone:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong className="mono-text" style={{ color: '#2563eb', fontSize: '0.9rem' }}>
                        {selectedUser.phone}
                      </strong>
                      <button
                        type="button"
                        className="jt-copy-btn"
                        onClick={() => handleCopyPhone(selectedUser.phone, selectedUser.name)}
                        title="Salin Nomor HP"
                      >
                        {copiedPhone === selectedUser.phone ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>PIN Keamanan (6 Digit):</span>
                    <strong className="mono-text" style={{ color: '#059669' }}>{selectedUser.pin}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Saldo E-Wallet Aktif:</span>
                    <strong style={{ color: '#0284c7', fontSize: '0.95rem' }}>
                      Rp {selectedUser.currentBalance.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card B: Informasi Perbankan & Statistik Keamanan */}
              <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                  🏦 Informasi Rekening & Keamanan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bank Utama:</span>
                    <span className={`jt-badge-channel ${getBankBadgeClass(selectedUser.defaultBank)}`} style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      <BankIcon size={11} />
                      <span>{selectedUser.defaultBank}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Nomor Rekening:</span>
                    <strong className="mono-text">{selectedUser.account}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Nomor Virtual Account:</span>
                    <strong className="mono-text" style={{ color: '#2563eb' }}>
                      8808{selectedUser.account.slice(0, 10)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Mini Stats Boxes for Selected User */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL TRANSAKSI</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedUser.txCount}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>TRANSAKSI AMAN</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {selectedUser.safeTxCount}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>MENCURIGAKAN</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                  {selectedUser.suspiciousTxCount}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL VOLUME</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2563eb', marginTop: '8px' }}>
                  Rp {selectedUser.totalVolume.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* User Transaction History Table (.custom-table) */}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Riwayat Aktivitas & Transaksi Nasabah ({selectedUserTransactions.length} Aktivitas)
              </div>
              <div className="table-container" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>WAKTU</th>
                      <th>ID TRANSAKSI</th>
                      <th>KANAL</th>
                      <th>NOMINAL</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserTransactions.map((tx) => {
                      const isSafeTx = tx.status !== 'SUSPICIOUS';
                      return (
                        <tr key={tx.id}>
                          <td style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{tx.timestamp}</td>
                          <td>
                            <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.78rem' }}>#{tx.id}</span>
                          </td>
                          <td style={{ fontSize: '0.78rem', fontWeight: 700 }}>{tx.channel}</td>
                          <td>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                              Rp {(tx.amount || 0).toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td>
                            <span className={`jt-badge-status ${isSafeTx ? 'berhasil' : 'mencurigakan'}`}>
                              {isSafeTx ? <CheckCircleIcon size={12} /> : <AlertTriangleIcon size={12} />}
                              <span>{isSafeTx ? 'Berhasil' : 'Mencurigakan'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedUser(null)}
              >
                Tutup Detail User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
