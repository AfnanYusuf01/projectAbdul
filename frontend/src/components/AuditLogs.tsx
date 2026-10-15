import React, { useState, useMemo } from 'react';
import type { AuditLog } from '../types';
import { Pagination } from './Pagination';
import { SearchIcon, RefreshIcon } from './Icons';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Column Filter States
  const [filterUser, setFilterUser] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterIp, setFilterIp] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDetail, setFilterDetail] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Distinct operators and actions from logs
  const distinctUsers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.user) set.add(l.user);
    });
    return Array.from(set);
  }, [logs]);

  const distinctActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set);
  }, [logs]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filterUser !== 'ALL' ||
    filterAction !== 'ALL' ||
    filterIp.trim() !== '' ||
    filterStatus !== 'ALL' ||
    filterDetail.trim() !== '' ||
    sortOrder !== 'desc';

  const resetAllFilters = () => {
    setSearchTerm('');
    setFilterUser('ALL');
    setFilterAction('ALL');
    setFilterIp('');
    setFilterStatus('ALL');
    setFilterDetail('');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        // Global search
        if (searchTerm.trim() !== '') {
          const s = searchTerm.toLowerCase();
          const match =
            log.user.toLowerCase().includes(s) ||
            log.action.toLowerCase().includes(s) ||
            log.details.toLowerCase().includes(s) ||
            log.source_ip.toLowerCase().includes(s);
          if (!match) return false;
        }

        // Column Filter: User
        if (filterUser !== 'ALL') {
          if (log.user !== filterUser) return false;
        }

        // Column Filter: Action
        if (filterAction !== 'ALL') {
          if (log.action !== filterAction) return false;
        }

        // Column Filter: IP
        if (filterIp.trim() !== '') {
          if (!log.source_ip.toLowerCase().includes(filterIp.toLowerCase())) {
            return false;
          }
        }

        // Column Filter: Status
        if (filterStatus !== 'ALL') {
          if (log.status !== filterStatus) return false;
        }

        // Column Filter: Detail
        if (filterDetail.trim() !== '') {
          if (!log.details.toLowerCase().includes(filterDetail.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [
    logs,
    searchTerm,
    filterUser,
    filterAction,
    filterIp,
    filterStatus,
    filterDetail,
    sortOrder
  ]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Log Audit Keamanan (Audit Trail)</h2>
          <p className="view-header-desc">
            Pencatatan riwayat aktivitas operator, investigasi fraud, dan integritas keamanan transaksi langsung dari database (Kepatuhan ISO 27001).
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-info" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
            Total Entri DB: {logs.length}
          </span>
          {hasActiveFilters && (
            <button className="filter-reset-btn" onClick={resetAllFilters} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <RefreshIcon size={12} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div className="card-title">
          <span>Riwayat Aktivitas Sistem ({filteredLogs.length} hasil ditemukan)</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Cari global User/Aksi/IP/Detail..."
                className="form-control"
                style={{ paddingLeft: '34px', height: '36px', fontSize: '0.82rem' }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <SearchIcon size={14} />
              </span>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              {/* Primary Column Headers */}
              <tr>
                <th style={{ minWidth: '150px' }}>Waktu Log</th>
                <th style={{ minWidth: '140px' }}>Operator</th>
                <th style={{ minWidth: '170px' }}>Kategori Aksi</th>
                <th style={{ minWidth: '130px' }}>Alamat IP</th>
                <th style={{ minWidth: '110px' }}>Status</th>
                <th style={{ minWidth: '240px' }}>Detail Deskripsi</th>
              </tr>

              {/* Column Filter Row */}
              <tr className="table-filter-header">
                {/* Waktu Filter */}
                <th>
                  <select
                    className="column-filter-select"
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value as 'desc' | 'asc');
                      setCurrentPage(1);
                    }}
                  >
                    <option value="desc">⬇ Terbaru</option>
                    <option value="asc">⬆ Terlama</option>
                  </select>
                </th>

                {/* Operator Filter */}
                <th>
                  <select
                    className="column-filter-select"
                    value={filterUser}
                    onChange={(e) => {
                      setFilterUser(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">Semua Operator</option>
                    {distinctUsers.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </th>

                {/* Action Filter */}
                <th>
                  <select
                    className="column-filter-select"
                    value={filterAction}
                    onChange={(e) => {
                      setFilterAction(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">Semua Aksi</option>
                    {distinctActions.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </th>

                {/* IP Filter */}
                <th>
                  <input
                    type="text"
                    className="column-filter-input"
                    placeholder="Filter IP..."
                    value={filterIp}
                    onChange={(e) => {
                      setFilterIp(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </th>

                {/* Status Filter */}
                <th>
                  <select
                    className="column-filter-select"
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">Semua</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </th>

                {/* Detail Filter */}
                <th>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="column-filter-input"
                      placeholder="Filter kata kunci detail..."
                      value={filterDetail}
                      onChange={(e) => {
                        setFilterDetail(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{ flexGrow: 1 }}
                    />
                    {hasActiveFilters && (
                      <button 
                        className="filter-reset-btn" 
                        style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                        onClick={resetAllFilters}
                        title="Reset filter kolom"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id}>
                  <td className="mono-text" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-blue-light)',
                        color: 'var(--primary-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {log.user ? log.user.slice(0, 1).toUpperCase() : 'U'}
                      </div>
                      <span style={{ fontWeight: 600 }}>{log.user}</span>
                    </div>
                  </td>
                  <td>
                    <span className="mono-text" style={{ 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      backgroundColor: 'var(--bg-subtle)', 
                      border: '1px solid var(--border-color)',
                      color: 'var(--primary-blue)',
                      fontWeight: 600
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td className="mono-text" style={{ color: 'var(--text-secondary)' }}>
                    {log.source_ip}
                  </td>
                  <td>
                    <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                      {log.status === 'SUCCESS' ? '● SUCCESS' : '▲ FAILED'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada catatan log audit yang cocok dengan kriteria filter kolom.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50]}
            itemLabel="catatan log"
          />
        </div>
      </div>
    </div>
  );
};
