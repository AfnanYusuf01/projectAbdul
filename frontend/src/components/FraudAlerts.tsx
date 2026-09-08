import React, { useState } from 'react';

interface Alert {
  id: number;
  transaction_id: string;
  timestamp: string;
  rule_id: number;
  rule_name: string;
  amount: number;
  severity: string;
  status: string;
  notes: string | null;
}

interface FraudAlertsProps {
  alerts: Alert[];
  onUpdateAlert: (id: number, status: string, notes: string) => Promise<void>;
  role: string;
}

export const FraudAlerts: React.FC<FraudAlertsProps> = ({ alerts, onUpdateAlert, role }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const filteredAlerts = alerts.filter(a => a.status === statusFilter);

  const pendingCount = alerts.filter(a => a.status === 'PENDING').length;
  const investigatedCount = alerts.filter(a => a.status === 'INVESTIGATED').length;
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

  const handleUpdate = async (status: string) => {
    if (!selectedAlert) return;
    try {
      await onUpdateAlert(selectedAlert.id, status, notes);
      setSelectedAlert(null);
      setNotes('');
    } catch (err) {
      alert('Gagal memperbarui status alert.');
    }
  };

  const handleOpenInvestigate = (alert: Alert) => {
    setSelectedAlert(alert);
    setNotes(alert.notes || '');
  };

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Peringatan Fraud (Fraud Alerts Feed)</h2>
          <p className="view-header-desc">
            Pemantauan insiden pelanggaran aturan keamanan secara real-time dan alur investigasi analis keamanan L2.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-info" style={{ padding: '6px 14px' }}>
            Akses: {role}
          </span>
        </div>
      </div>

      {/* Main Alerts Card */}
      <div className="card">
        <div className="card-title">
          <span>Daftar Peringatan Keamanan</span>
          
          {/* Willow Pill Filter */}
          <div style={{ display: 'inline-flex', gap: '6px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn btn-small ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
              style={statusFilter === 'PENDING' ? { backgroundColor: '#ef4444', borderColor: '#ef4444' } : { border: 'none', background: 'transparent' }}
              onClick={() => setStatusFilter('PENDING')}
            >
              ⚠️ Pending ({pendingCount})
            </button>
            <button 
              className={`btn btn-small ${statusFilter === 'INVESTIGATED' ? 'btn-primary' : 'btn-secondary'}`}
              style={statusFilter === 'INVESTIGATED' ? {} : { border: 'none', background: 'transparent' }}
              onClick={() => setStatusFilter('INVESTIGATED')}
            >
              🔍 Investigated ({investigatedCount})
            </button>
            <button 
              className={`btn btn-small ${statusFilter === 'RESOLVED' ? 'btn-primary' : 'btn-secondary'}`}
              style={statusFilter === 'RESOLVED' ? { backgroundColor: '#10b981', borderColor: '#10b981' } : { border: 'none', background: 'transparent' }}
              onClick={() => setStatusFilter('RESOLVED')}
            >
              ✓ Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Waktu Kejadian</th>
                <th>ID Transaksi</th>
                <th>Aturan Terpicu</th>
                <th>Nominal</th>
                <th>Tingkat Bahaya</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className={alert.status === 'PENDING' && alert.severity === 'HIGH' ? 'pulse-red' : ''}>
                  <td className="mono-text" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {new Date(alert.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="mono-text">
                    <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                      {alert.transaction_id}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.88rem' }}>{alert.rule_name}</strong>
                  </td>
                  <td className="mono-text" style={{ fontWeight: 600 }}>
                    Rp {alert.amount.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className={`badge ${alert.severity === 'HIGH' ? 'badge-danger' : alert.severity === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${alert.status === 'PENDING' ? 'badge-danger' : alert.status === 'INVESTIGATED' ? 'badge-warning' : 'badge-success'}`}>
                      ● {alert.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleOpenInvestigate(alert)}
                      disabled={role !== 'FraudAnalyst'}
                      title={role !== 'FraudAnalyst' ? "Hanya FraudAnalyst yang memiliki akses investigasi alert" : "Investigasi Alert"}
                    >
                      {role !== 'FraudAnalyst' ? '🔒 Terkunci' : '👁 Investigasi'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Tidak ada peringatan fraud dalam status {statusFilter}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigate Detail Modal */}
      {selectedAlert && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Tindakan Investigasi Alert Fraud</h3>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.4rem' }}
                onClick={() => setSelectedAlert(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px',
                fontSize: '0.84rem',
                lineHeight: '1.7'
              }}>
                <div><strong>ID Transaksi</strong>: <span className="mono-text" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{selectedAlert.transaction_id}</span></div>
                <div><strong>Aturan Terpicu</strong>: {selectedAlert.rule_name}</div>
                <div><strong>Nominal Pengujian</strong>: Rp {selectedAlert.amount.toLocaleString('id-ID')}</div>
                <div><strong>Keterangan Deteksi</strong>: {selectedAlert.notes || 'Dipicu secara otomatis oleh sistem deteksi.'}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Hasil Investigasi Analis</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Tambahkan catatan (contoh: Transaksi telah diverifikasi dengan nasabah, atau Nomor kartu masuk daftar pencurian)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedAlert(null)}>
                Batal
              </button>
              {selectedAlert.status !== 'INVESTIGATED' && (
                <button className="btn btn-secondary" style={{ borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)' }} onClick={() => handleUpdate('INVESTIGATED')}>
                  🔍 Tandai Investigated
                </button>
              )}
              {selectedAlert.status !== 'RESOLVED' && (
                <button className="btn btn-primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} onClick={() => handleUpdate('RESOLVED')}>
                  ✓ Selesaikan (Resolved)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
