import React, { useState } from 'react';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  source_ip: string;
  status: string;
  details: string;
}

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source_ip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Log Audit Keamanan (Audit Trail)</h2>
          <p className="view-header-desc">
            Pencatatan riwayat aktivitas operator, investigasi fraud, dan integritas keamanan transaksi (Kepatuhan ISO 27001).
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-info" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
            Total Entri: {logs.length}
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="card-title">
          <span>Riwayat Aktivitas Sistem</span>
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Cari User / Aksi / IP / Detail..."
              className="form-control"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.82rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              🔍
            </span>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Waktu Log</th>
                <th>Operator</th>
                <th>Kategori Aksi</th>
                <th>Alamat IP</th>
                <th>Status</th>
                <th>Detail Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
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
                        {log.user.slice(0, 1).toUpperCase()}
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
                    Tidak ada catatan log audit yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
