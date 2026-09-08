import React, { useState } from 'react';

interface Rule {
  id: number;
  name: string;
  parameter: string;
  operator: string;
  threshold: string;
  severity: string;
  is_active: boolean;
  description: string;
}

interface FraudDetectionProps {
  rules: Rule[];
  onToggleRule: (id: number, is_active: boolean) => Promise<void>;
  onCreateRule: (rule: Omit<Rule, 'id'>) => Promise<void>;
  role: string;
}

export const FraudDetection: React.FC<FraudDetectionProps> = ({ rules, onToggleRule, onCreateRule, role }) => {
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
  const [simResults, setSimResults] = useState<any[] | null>(null);

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
    } catch (err) {
      alert('Gagal membuat aturan baru.');
    }
  };

  // Local dry-run evaluation logic for the Simulation Playground
  const runSimulation = () => {
    const triggered: any[] = [];
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
          } catch(e) {}
        }
      } else if (rule.parameter === 'velocity') {
        // Mock a velocity of 6 for demonstration if they select velocity
        const threshold = parseInt(rule.threshold);
        if (rule.operator === '>' && 6 > threshold) isTriggered = true;
      }

      if (isTriggered) {
        triggered.push(rule);
      }
    });

    setSimResults(triggered);
  };

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Deteksi Fraud (Rule-Based Engine)</h2>
          <p className="view-header-desc">
            Manajemen parameter aturan deteksi fraud transaksi dan simulator evaluasi kriteria keamanan.
          </p>
        </div>
        <span className="badge badge-info" style={{ padding: '6px 14px' }}>
          Aturan Aktif: {rules.filter(r => r.is_active).length}/{rules.length}
        </span>
      </div>

      <div className="grid-split">
        {/* Left Side: Active Fraud Rules Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Daftar Aturan Fraud (Rule-Based)</span>
              {role === 'SecurityAdmin' && (
                <button className="btn btn-primary btn-small" onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? '✕ Batal' : '＋ Tambah Aturan'}
                </button>
              )}
            </div>

            {showAddForm && (
              <form onSubmit={handleCreate} style={{ marginBottom: '25px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--accent-cyan)' }}>Aturan Baru</h4>
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
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="==">==</option>
                      <option value="in_range">in_range (misal: 2-4)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batas Ambang (Threshold)</label>
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
                  <label className="form-label">Deskripsi</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Penjelasan aturan bisnis..."
                  />
                </div>

                <button type="submit" className="btn btn-primary">Simpan Aturan</button>
              </form>
            )}

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Nama Aturan</th>
                    <th>Logika Kriteria</th>
                    <th>Severity</th>
                    <th>Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} style={{ opacity: rule.is_active ? 1 : 0.4 }}>
                      <td style={{ width: '60px' }}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={rule.is_active}
                            onChange={(e) => onToggleRule(rule.id, e.target.checked)}
                            disabled={role !== 'SecurityAdmin'}
                            title={role !== 'SecurityAdmin' ? "Hanya SecurityAdmin yang dapat mengaktifkan/menonaktifkan aturan" : ""}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                      <td style={{ fontWeight: 600 }}>{rule.name}</td>
                      <td className="mono-text" style={{ color: 'var(--accent-cyan)' }}>
                        {rule.parameter} {rule.operator} {rule.threshold}
                      </td>
                      <td>
                        <span className={`badge ${rule.severity === 'HIGH' ? 'badge-danger' : rule.severity === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`}>
                          {rule.severity}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{rule.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Simulation Playground */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-title">Simulasi Evaluasi Aturan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Uji coba aturan fraud di atas secara instan sebelum melakukan transaksi sungguhan.
              </p>
              
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
                <label className="form-label">Jam Transaksi (0-23 WIB)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  className="form-control"
                  value={simData.hour}
                  onChange={(e) => setSimData({ ...simData, hour: parseInt(e.target.value) })}
                />
              </div>

              <button className="btn btn-primary" onClick={runSimulation}>
                ⚡ Uji Kriteria Fraud
              </button>

              {simResults !== null && (
                <div style={{ marginTop: '15px' }}>
                  <span className="form-label">Hasil Evaluasi</span>
                  {simResults.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {simResults.map(rule => (
                        <div 
                          key={rule.id} 
                          style={{
                            padding: '10px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--accent-red-dim)',
                            color: 'var(--accent-red)',
                            fontSize: '0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong>{rule.name}</strong>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Kriteria: {rule.parameter} {rule.operator} {rule.threshold}</div>
                          </div>
                          <span className="badge badge-danger">{rule.severity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      style={{
                        padding: '10px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--accent-green-dim)',
                        color: 'var(--accent-green)',
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}
                    >
                      ✓ Aman. Transaksi lolos kriteria fraud.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
