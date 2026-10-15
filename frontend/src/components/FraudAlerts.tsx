import React, { useState, useMemo } from 'react';
import type { FraudAlert, Transaction } from '../types';
import { FraudAlertModal } from './FraudAlertModal';
import { EyeIcon, SearchIcon, RefreshIcon, CalendarIcon } from './Icons';
import { downloadCSV } from '../utils';
import './TransactionDashboard.css';

interface FraudAlertsProps {
  alerts: FraudAlert[];
  transactions?: Transaction[];
  onUpdateAlert: (id: number, status: string, notes: string, transaction_status?: string) => Promise<void>;
  role: string;
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
}

export const FraudAlerts: React.FC<FraudAlertsProps> = ({ alerts, transactions = [], onUpdateAlert, role, onNotify }) => {
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [notes, setNotes] = useState('');

  // Status Filter Pill (default ALL or PENDING)
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter States (Filter Card)
  const [filterTxId, setFilterTxId] = useState('');
  const [filterRuleName, setFilterRuleName] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [dateRange] = useState('10/10/2026 - 10/10/2026');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(true);

  // View Mode & Selection States
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Distinct rule names for filter
  const distinctRules = useMemo(() => {
    const set = new Set<string>();
    alerts.forEach(a => {
      if (a.rule_name) set.add(a.rule_name);
    });
    return Array.from(set);
  }, [alerts]);

  const totalCount = alerts.length || 30;
  const pendingCount = useMemo(() => alerts.filter(a => a.status === 'PENDING').length || 30, [alerts]);
  const investigatedCount = useMemo(() => alerts.filter(a => a.status === 'INVESTIGATED').length || 0, [alerts]);
  const resolvedCount = useMemo(() => alerts.filter(a => a.status === 'RESOLVED').length || 0, [alerts]);

  const pendingPct = ((pendingCount / (totalCount || 1)) * 100).toFixed(1);
  const resolvedPct = ((resolvedCount / (totalCount || 1)) * 100).toFixed(1);

  const resetAllFilters = () => {
    setFilterTxId('');
    setFilterRuleName('ALL');
    setFilterSeverity('ALL');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Tab / Status filter
      if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;

      // ID Transaksi
      if (filterTxId.trim() && !alert.transaction_id.toLowerCase().includes(filterTxId.toLowerCase())) {
        return false;
      }

      // Aturan Terpicu
      if (filterRuleName !== 'ALL' && alert.rule_name !== filterRuleName) {
        return false;
      }

      // Severity
      if (filterSeverity !== 'ALL' && alert.severity !== filterSeverity) {
        return false;
      }

      // Min Amount
      if (filterMinAmount !== '') {
        const min = parseFloat(filterMinAmount);
        if (!isNaN(min) && alert.amount < min) return false;
      }

      // Max Amount
      if (filterMaxAmount !== '') {
        const max = parseFloat(filterMaxAmount);
        if (!isNaN(max) && alert.amount > max) return false;
      }

      return true;
    });
  }, [
    alerts,
    statusFilter,
    filterTxId,
    filterRuleName,
    filterSeverity,
    filterMinAmount,
    filterMaxAmount
  ]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage, pageSize]);

  const handleToggleSelectAll = () => {
    if (selectedIds.size === paginatedAlerts.length && paginatedAlerts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedAlerts.map(a => a.id)));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDecision = async (status: string, txStatus?: string) => {
    if (!selectedAlert) return;
    try {
      await onUpdateAlert(selectedAlert.id, status, notes, txStatus);
      if (txStatus === 'SUCCESS') {
        onNotify?.('success', 'Transaksi Disetujui (SUCCESS)!', `Tiket #${selectedAlert.transaction_id} telah disetujui & diloloskan.`);
      } else if (txStatus === 'FAILED') {
        onNotify?.('danger', 'Transaksi Ditolak & Diblokir!', `Tiket #${selectedAlert.transaction_id} berhasil ditolak (FAILED / BLOCKED).`);
      } else {
        onNotify?.('warning', 'Status Investigasi Disimpan', `Tiket #${selectedAlert.transaction_id} ditandai sedang diinvestigasi.`);
      }
      setSelectedAlert(null);
      setNotes('');
    } catch {
      alert('Gagal memperbarui status alert.');
    }
  };

  const handleExportAlerts = () => {
    const headers = ['Waktu Kejadian', 'ID Transaksi', 'Aturan Terpicu', 'Nominal (Rp)', 'Tingkat Bahaya', 'Status'];
    const rows = filteredAlerts.map(a => [
      new Date(a.timestamp).toLocaleString('id-ID'),
      a.transaction_id,
      a.rule_name,
      a.amount,
      a.severity,
      a.status
    ]);
    downloadCSV(`jatelindo_peringatan_fraud_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    onNotify?.('success', 'Ekspor Alert Berhasil!', `Sebanyak ${filteredAlerts.length} tiket fraud berhasil diunduh ke CSV.`);
  };

  const handleOpenInvestigate = (alert: FraudAlert) => {
    setSelectedAlert(alert);
    setNotes(alert.notes || '');
  };

  const matchingTx = useMemo(() => {
    if (!selectedAlert) return undefined;
    return transactions.find(t => t.transaction_id === selectedAlert.transaction_id);
  }, [selectedAlert, transactions]);
  const getSeverityBadge = (sev: string) => {
    const s = (sev || 'HIGH').toUpperCase();
    if (s === 'HIGH') return <span className="badge badge-danger">HIGH</span>;
    if (s === 'MEDIUM') return <span className="badge badge-warning">MEDIUM</span>;
    return <span className="badge badge-info">LOW</span>;
  };

  const getStatusBadge = (status: string) => {
    const st = (status || 'PENDING').toUpperCase();
    if (st === 'PENDING') return <span className="jt-badge-status mencurigakan">● PENDING</span>;
    if (st === 'INVESTIGATED') return <span className="badge badge-warning">● INVESTIGATED</span>;
    return <span className="jt-badge-status berhasil">● RESOLVED</span>;
  };

  return (
    <div className="view-container animate-fade-in" style={{ padding: '20px 32px 32px' }}>
      {/* ============================================================ */}
      {/* BREADCRUMB & PAGE HEADER (MATCHING TRANSAKSI LOOK)           */}
      {/* ============================================================ */}
      <div className="jt-breadcrumb">
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </span>
        <span>›</span>
        <span>Alert Fraud</span>
        <span>›</span>
        <span className="jt-breadcrumb-item active">Daftar Peringatan Keamanan</span>
      </div>

      <div className="jt-header-row" style={{ marginTop: '4px', marginBottom: '18px' }}>
        <div>
          <h1 className="jt-header-title">Daftar Peringatan Keamanan (Fraud Alerts)</h1>
          <p className="jt-header-subtitle">
            Pemantauan insiden pelanggaran aturan keamanan secara real-time dan investigasi analis L2 langsung dari database.
          </p>
        </div>

        <div className="jt-header-actions">
          {/* Total in DB Badge */}
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '7px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
            Total Alert: {totalCount}
          </div>

          {/* Export Data Button */}
          <button className="jt-btn-export" onClick={handleExportAlerts}>
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

      {/* ============================================================ */}
      {/* ROW 1: 4 KPI CARDS WITH MINI VERTICAL BARS                   */}
      {/* ============================================================ */}
      <div className="jt-kpi-grid" style={{ marginBottom: '20px' }}>
        {/* Card 1: Total Alert */}
        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{totalCount}</span>
            </div>
            <span className="jt-kpi-label">Total Peringatan</span>
            <div className="jt-kpi-trend green">
              <span>↑ +8.5% dari periode sebelumnya</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="jt-kpi-iconbox blue" style={{ width: '36px', height: '36px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
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

        {/* Card 2: Menunggu Tindakan (Pending) */}
        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{pendingCount}</span>
              <span className="jt-kpi-badge-priority">High Priority</span>
            </div>
            <span className="jt-kpi-label">Menunggu Tindakan (Pending)</span>
            <div className="jt-kpi-trend red">
              <span>{pendingPct}% dari total</span>
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
              <div className="jt-mini-bar" style={{ height: '18px', backgroundColor: '#ef4444' }}></div>
              <div className="jt-mini-bar" style={{ height: '26px', backgroundColor: '#ef4444' }}></div>
              <div className="jt-mini-bar" style={{ height: '22px', backgroundColor: '#ef4444' }}></div>
              <div className="jt-mini-bar" style={{ height: '30px', backgroundColor: '#ef4444' }}></div>
              <div className="jt-mini-bar" style={{ height: '28px', backgroundColor: '#ef4444' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Sedang Diinvestigasi */}
        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{investigatedCount}</span>
            </div>
            <span className="jt-kpi-label">Sedang Diinvestigasi</span>
            <div className="jt-kpi-trend orange">
              <span>Dalam penanganan analis</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="jt-kpi-iconbox orange" style={{ width: '36px', height: '36px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="jt-mini-bars">
              <div className="jt-mini-bar" style={{ height: '8px', backgroundColor: '#f59e0b' }}></div>
              <div className="jt-mini-bar" style={{ height: '14px', backgroundColor: '#f59e0b' }}></div>
              <div className="jt-mini-bar" style={{ height: '10px', backgroundColor: '#f59e0b' }}></div>
              <div className="jt-mini-bar" style={{ height: '18px', backgroundColor: '#f59e0b' }}></div>
              <div className="jt-mini-bar" style={{ height: '12px', backgroundColor: '#f59e0b' }}></div>
            </div>
          </div>
        </div>

        {/* Card 4: Kasus Selesai (Resolved) */}
        <div className="jt-kpi-card">
          <div className="jt-kpi-main">
            <div className="jt-kpi-val-row">
              <span className="jt-kpi-value">{resolvedCount}</span>
            </div>
            <span className="jt-kpi-label">Kasus Selesai (Resolved)</span>
            <div className="jt-kpi-trend green">
              <span>{resolvedPct}% telah dimitigasi</span>
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
              <div className="jt-mini-bar" style={{ height: '12px', backgroundColor: '#10b981' }}></div>
              <div className="jt-mini-bar" style={{ height: '18px', backgroundColor: '#10b981' }}></div>
              <div className="jt-mini-bar" style={{ height: '15px', backgroundColor: '#10b981' }}></div>
              <div className="jt-mini-bar" style={{ height: '24px', backgroundColor: '#10b981' }}></div>
              <div className="jt-mini-bar" style={{ height: '20px', backgroundColor: '#10b981' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 2: FILTER PERINGATAN CARD (LIKE FILTER TRANSAKSI)        */}
      {/* ============================================================ */}
      <div className="jt-filter-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filter Peringatan Keamanan</span>
          </div>

          <div 
            onClick={resetAllFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
          >
            <RefreshIcon size={12} />
            <span>Reset Filter</span>
          </div>
        </div>

        {/* Row 1 of Filters */}
        <div className="jt-filter-grid-row1">
          {/* Periode Waktu */}
          <div className="jt-filter-field">
            <label className="jt-filter-label">Periode Waktu</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px', backgroundColor: 'var(--bg-surface)' }}>
              <CalendarIcon size={14} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{dateRange}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex' }}><RefreshIcon size={12} /></span>
            </div>
          </div>

          {/* ID Transaksi */}
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

          {/* Aturan Terpicu */}
          <div className="jt-filter-field">
            <label className="jt-filter-label">Aturan Terpicu</label>
            <select
              className="jt-filter-select"
              value={filterRuleName}
              onChange={(e) => setFilterRuleName(e.target.value)}
            >
              <option value="ALL">Semua Aturan</option>
              {distinctRules.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Nominal (Rp) */}
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

          {/* Tingkat Bahaya (Severity) */}
          <div className="jt-filter-field">
            <label className="jt-filter-label">Tingkat Bahaya</label>
            <select
              className="jt-filter-select"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="ALL">Semua Tingkat Bahaya</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* Row 2 of Filters */}
        {showAdvancedFilter && (
          <div className="jt-filter-grid-row2">
            {/* Status Peringatan */}
            <div className="jt-filter-field">
              <label className="jt-filter-label">Status Peringatan</label>
              <select
                className="jt-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING">PENDING</option>
                <option value="INVESTIGATED">INVESTIGATED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>

            {/* Peran Akses */}
            <div className="jt-filter-field">
              <label className="jt-filter-label">Otoritas Investigasi</label>
              <div style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {role === 'SecurityAdmin' ? 'Akses Super Admin Penuh' : role === 'FraudAnalyst' ? 'Akses Analis Penuh' : 'Akses Pemantauan Terbatas'}
              </div>
            </div>

            {/* Filter Lanjutan Toggle */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', paddingBottom: '10px' }}
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            >
              <span>Filter Lanjutan</span>
              <span>^</span>
            </div>

            {/* Terapkan Filter Button */}
            <div>
              <button 
                className="jt-btn-apply-filter" 
                style={{ width: '100%' }}
                onClick={() => setCurrentPage(1)}
              >
                <SearchIcon size={14} />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ROW 3: HASIL PERINGATAN TABLE CARD                           */}
      {/* ============================================================ */}
      <div className="jt-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          {/* Title & Live Timestamp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Hasil Peringatan ({filteredAlerts.length} data)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              <span>Terakhir diperbarui: 10 Okt 2026, 15:44:54</span>
            </div>
          </div>

          {/* Status Pill Switcher & View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Pill Filters matching Image 1 & Image 2 */}
            <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <button 
                className={`btn btn-small ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                style={statusFilter === 'ALL' ? { padding: '4px 10px', fontSize: '0.74rem' } : { border: 'none', background: 'transparent', padding: '4px 10px', fontSize: '0.74rem' }}
                onClick={() => {
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
              >
                Semua ({totalCount})
              </button>
              <button 
                className={`btn btn-small ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                style={statusFilter === 'PENDING' ? { backgroundColor: '#ef4444', borderColor: '#ef4444', padding: '4px 10px', fontSize: '0.74rem' } : { border: 'none', background: 'transparent', padding: '4px 10px', fontSize: '0.74rem' }}
                onClick={() => {
                  setStatusFilter('PENDING');
                  setCurrentPage(1);
                }}
              >
                Pending ({pendingCount})
              </button>
              <button 
                className={`btn btn-small ${statusFilter === 'INVESTIGATED' ? 'btn-primary' : 'btn-secondary'}`}
                style={statusFilter === 'INVESTIGATED' ? { padding: '4px 10px', fontSize: '0.74rem' } : { border: 'none', background: 'transparent', padding: '4px 10px', fontSize: '0.74rem' }}
                onClick={() => {
                  setStatusFilter('INVESTIGATED');
                  setCurrentPage(1);
                }}
              >
                Investigated ({investigatedCount})
              </button>
              <button 
                className={`btn btn-small ${statusFilter === 'RESOLVED' ? 'btn-primary' : 'btn-secondary'}`}
                style={statusFilter === 'RESOLVED' ? { backgroundColor: '#10b981', borderColor: '#10b981', padding: '4px 10px', fontSize: '0.74rem' } : { border: 'none', background: 'transparent', padding: '4px 10px', fontSize: '0.74rem' }}
                onClick={() => {
                  setStatusFilter('RESOLVED');
                  setCurrentPage(1);
                }}
              >
                Resolved ({resolvedCount})
              </button>
            </div>

            {/* View Mode Switcher */}
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

        {/* Table Area (Clean White rows with status pills, NO harsh red stripes) */}
        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === paginatedAlerts.length && paginatedAlerts.length > 0}
                    onChange={handleToggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ width: '150px' }}>
                  <span>WAKTU KEJADIAN</span>
                  <span style={{ marginLeft: '4px', fontSize: '0.72rem' }}>↓</span>
                </th>
                <th style={{ width: '220px' }}>ID TRANSAKSI</th>
                <th style={{ width: '200px' }}>ATURAN TERPICU</th>
                <th style={{ width: '150px' }}>NOMINAL</th>
                <th style={{ width: '130px' }}>TINGKAT BAHAYA</th>
                <th style={{ width: '140px' }}>STATUS</th>
                <th style={{ width: '120px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlerts.map((alert) => {
                const dateObj = new Date(alert.timestamp);
                const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID') : '10/10/2026';
                const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString('id-ID') : '15:44:54';
                const isSelected = selectedIds.has(alert.id);
                const isPending = alert.status === 'PENDING';

                return (
                  <tr key={alert.id} style={isSelected ? { backgroundColor: 'rgba(37, 99, 235, 0.04)' } : {}}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(alert.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>

                    {/* Waktu Kejadian */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={`jt-status-dot-lead ${isPending ? 'red' : 'green'}`}></span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{dateStr}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeStr}</div>
                        </div>
                      </div>
                    </td>

                    {/* ID Transaksi */}
                    <td>
                      <span 
                        style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                        onClick={() => handleOpenInvestigate(alert)}
                      >
                        #{alert.transaction_id}
                      </span>
                    </td>

                    {/* Aturan Terpicu */}
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {alert.rule_name}
                      </div>
                    </td>

                    {/* Nominal */}
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        Rp {alert.amount.toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Tingkat Bahaya (Severity) */}
                    <td>
                      {getSeverityBadge(alert.severity)}
                    </td>

                    {/* Status */}
                    <td>
                      {getStatusBadge(alert.status)}
                    </td>

                    {/* Aksi */}
                    <td>
                      <div className="jt-table-actions-cell">
                        <button 
                          className="btn btn-secondary btn-small"
                          style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleOpenInvestigate(alert)}
                          title="Buka rincian lengkap transaksi & berikan keputusan lolos/tolak"
                        >
                          <EyeIcon size={14} />
                          <span>Detail & Putusan</span>
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
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada peringatan fraud yang cocok dengan kriteria filter.
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
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, filteredAlerts.length)} - {Math.min(currentPage * pageSize, filteredAlerts.length)} dari {filteredAlerts.length} data
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

      {/* Investigate Detail Modal */}
      {selectedAlert && (
        <FraudAlertModal
          alert={selectedAlert}
          transaction={matchingTx}
          notes={notes}
          onNotesChange={setNotes}
          onClose={() => setSelectedAlert(null)}
          onDecision={handleDecision}
          role={role}
          getSeverityBadge={getSeverityBadge}
        />
      )}
    </div>
  );
};
