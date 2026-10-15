import React, { useState } from 'react';
import type { FraudRule } from '../types';
import { ZapIcon, AlertTriangleIcon, CheckCircleIcon, FileSpreadsheetIcon } from './Icons';
interface FraudDetectionProps {
  rules: FraudRule[];
  onToggleRule: (id: number, is_active: boolean) => Promise<void>;
  onCreateRule: (rule: Omit<FraudRule, 'id'>) => Promise<void>;
  apiBase?: string;
  role: string;
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
}

export const FraudDetection: React.FC<FraudDetectionProps> = ({
  rules,
  onToggleRule,
  onCreateRule,
  apiBase: _apiBase,
  role,
  onNotify
}) => {
  // New Rule Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    parameter: 'amount',
    operator: '>',
    threshold: '',
    severity: 'MEDIUM',
    description: ''
  });

  // Simulation Playground State
  const [simData, setSimData] = useState({
    customer_id: 'CUST-102',
    amount: 15000000,
    hour: 3
  });
  const [simResults, setSimResults] = useState<FraudRule[] | null>(null);



  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.threshold) return;
    try {
      await onCreateRule({
        ...newRule,
        is_active: true
      });
      setShowAddForm(false);
      setNewRule({
        name: '',
        parameter: 'amount',
        operator: '>',
        threshold: '',
        severity: 'MEDIUM',
        description: ''
      });
      onNotify?.('success', 'Aturan Baru Berhasil Ditambahkan!', `Aturan '${newRule.name}' telah diaktifkan ke dalam Fraud Engine.`);
    } catch {
      alert('Gagal membuat aturan baru.');
    }
  };

  const runSimulation = () => {
    const triggered: FraudRule[] = [];
    const activeRules = rules.filter(r => r.is_active);

    activeRules.forEach(rule => {
      let isTriggered = false;
      
      if (rule.parameter === 'amount') {
        const threshold = parseFloat(rule.threshold);
        if (rule.operator === '>' && simData.amount > threshold) isTriggered = true;
        if (rule.operator === '<' && simData.amount < threshold) isTriggered = true;
        if (rule.operator === '==' && simData.amount === threshold) isTriggered = true;
      } else if (rule.parameter === 'hour') {
        if (rule.operator === 'in_range') {
          try {
            const parts = rule.threshold.split('-');
            const start = parseInt(parts[0]);
            const end = parseInt(parts[1]);
            if (start <= end) {
              if (simData.hour >= start && simData.hour <= end) isTriggered = true;
            } else {
              if (simData.hour >= start || simData.hour <= end) isTriggered = true;
            }
          } catch {}
        }
      } else if (rule.parameter === 'velocity') {
        const threshold = parseInt(rule.threshold);
        if (rule.operator === '>' && 6 > threshold) isTriggered = true;
      }

      if (isTriggered) {
        triggered.push(rule);
      }
    });

    setSimResults(triggered);
    if (triggered.length > 0) {
      onNotify?.('danger', 'Simulasi Mendeteksi Anomali!', `Transaksi melanggar ${triggered.length} aturan: ${triggered.map(t => t.name).join(', ')}.`);
    } else {
      onNotify?.('success', 'Simulasi Transaksi Normal', 'Transaksi buatan lolos seluruh kriteria aturan fraud.');
    }
  };

  return (
    <div className="view-container animate-fade-in">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Deteksi Fraud (Rule-Based Engine)</h2>
          <p className="view-header-desc">
            Manajemen parameter aturan deteksi fraud transaksi dan evaluasi empiris efektivitas deteksi (Bab IV Skripsi).
          </p>
        </div>
        <span className="badge badge-info" style={{ padding: '6px 14px' }}>
          Aturan Aktif: {rules.filter(r => r.is_active).length}/{rules.length}
        </span>
      </div>

      {/* SECTION 1: RULES MANAGEMENT & SINGLE SIMULATION */}
      <div className="grid-split">
        {/* Left Side: Active Fraud Rules Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Daftar Aturan Fraud (Rule-Based)</span>
              {role === 'SecurityAdmin' && (
                <button className="btn btn-primary btn-small" onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? 'Batal' : '+ Tambah Aturan'}
                </button>
              )}
            </div>

            {showAddForm && (
              <form onSubmit={handleCreate} style={{ marginBottom: '25px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-subtle)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--primary-blue)' }}>Aturan Baru</h4>
                <div className="grid-half">
                  <div className="form-group">
                    <label className="form-label">Nama Aturan</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      placeholder="e.g. Batas Transaksi Kartu Kredit"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tingkat Bahaya (Severity)</label>
                    <select
                      className="form-control"
                      value={newRule.severity}
                      onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                </div>

                <div className="grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">Parameter</label>
                    <select
                      className="form-control"
                      value={newRule.parameter}
                      onChange={(e) => setNewRule({ ...newRule, parameter: e.target.value })}
                    >
                      <option value="amount">Nominal (Amount)</option>
                      <option value="hour">Jam Transaksi (Hour)</option>
                      <option value="velocity">Frekuensi (Velocity)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operator</label>
                    <select
                      className="form-control"
                      value={newRule.operator}
                      onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                    >
                      <option value=">">&gt; (Lebih Dari)</option>
                      <option value="<">&lt; (Kurang Dari)</option>
                      <option value="==">== (Sama Dengan)</option>
                      <option value="in_range">in_range (Rentang)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ambang Batas (Threshold)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newRule.threshold}
                      onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })}
                      placeholder="e.g. 10000000 atau 2-4"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi Kasus</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="e.g. Menandai anomali transaksi malam hari"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-small" style={{ marginTop: '10px' }}>
                  Simpan Aturan
                </button>
              </form>
            )}

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Nama Aturan</th>
                    <th>Kriteria Logika</th>
                    <th>Tingkat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td>
                        <span className={`badge ${rule.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {rule.is_active ? '● AKTIF' : '○ NON-AKTIF'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rule.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{rule.description}</div>
                      </td>
                      <td className="mono-text" style={{ fontSize: '0.78rem' }}>
                        {rule.parameter} {rule.operator} {rule.threshold}
                      </td>
                      <td>
                        <span className={`badge ${rule.severity === 'HIGH' ? 'badge-danger' : rule.severity === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`}>
                          {rule.severity}
                        </span>
                      </td>
                      <td>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={rule.is_active} 
                            onChange={(e) => {
                              onToggleRule(rule.id, e.target.checked);
                              onNotify?.('info', 'Status Aturan Diperbarui', `Aturan '${rule.name}' diubah menjadi ${e.target.checked ? 'AKTIF' : 'NON-AKTIF'}.`);
                            }}
                            disabled={role !== 'SecurityAdmin'}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Dry-run Simulation Playground */}
        <div>
          <div className="card">
            <div className="card-title">Simulator Pengujian Tunggal</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Uji coba kecocokan aturan terhadap satu transaksi buatan secara offline sebelum diterapkan ke sistem produksi.
            </p>

            <div className="form-group">
              <label className="form-label">ID Pelanggan</label>
              <input
                type="text"
                className="form-control"
                value={simData.customer_id}
                onChange={(e) => setSimData({ ...simData, customer_id: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nominal Transaksi (Rp)</label>
              <input
                type="number"
                className="form-control"
                value={simData.amount}
                onChange={(e) => setSimData({ ...simData, amount: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jam Transaksi (0 - 23 WIB)</label>
              <input
                type="number"
                className="form-control"
                value={simData.hour}
                min="0"
                max="23"
                onChange={(e) => setSimData({ ...simData, hour: parseInt(e.target.value) })}
              />
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={runSimulation}>
              <ZapIcon size={14} />
              <span>Uji Aturan Tunggal</span>
            </button>

            {simResults !== null && (
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', backgroundColor: simResults.length > 0 ? '#fef2f2' : '#ecfdf5', border: `1px solid ${simResults.length > 0 ? '#fecaca' : '#a7f3d0'}` }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: simResults.length > 0 ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {simResults.length > 0 ? <><AlertTriangleIcon size={16} /> Terdeteksi {simResults.length} Aturan Fraud!</> : <><CheckCircleIcon size={16} /> Transaksi Bersih (Lolos Tanpa Alert)</>}
                </div>
                {simResults.length > 0 && (
                  <ul style={{ margin: '8px 0 0 18px', fontSize: '0.76rem', color: '#991b1b' }}>
                    {simResults.map(r => (
                      <li key={r.id}><strong>{r.name}</strong> ({r.severity})</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Banner for Thesis Report Suite */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileSpreadsheetIcon size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e40af' }}>
              Evaluasi Ilmiah Confusion Matrix & Ekspor Laporan (Bab 4.3 Skripsi)
            </div>
            <div style={{ fontSize: '0.76rem', color: '#3b82f6' }}>
              Pengujian otomatis 100 sampel dataset, 4-Kuadran Confusion Matrix, dan ekspor file CSV laporan pengujian kini dipusatkan pada menu khusus <strong>Laporan Evaluasi</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
