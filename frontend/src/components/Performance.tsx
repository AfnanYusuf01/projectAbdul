import React, { useState } from 'react';

interface PerformanceProps {
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    active_connections: number;
    avg_encryption_time_ms: number;
    avg_decryption_time_ms: number;
    total_transactions_processed: number;
    throughput_tps: number;
  };
  onSimulate: (count: number) => Promise<void>;
}

export const Performance: React.FC<PerformanceProps> = ({ metrics, onSimulate }) => {
  const [burstCount, setBurstCount] = useState(25);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await onSimulate(burstCount);
      alert(`Simulasi ${burstCount} transaksi berhasil dimulai di background server.`);
    } catch (err) {
      alert('Gagal menjalankan simulasi.');
    } finally {
      setSimulating(false);
    }
  };

  // SVG Gauge calculations
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  const getStrokeDashOffset = (percentage: number) => {
    return circumference - (percentage / 100) * circumference;
  };

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Performa & Telemetri Sistem (System Metrics)</h2>
          <p className="view-header-desc">
            Pemantauan utilisasi perangkat keras, kecepatan operasi kriptografi (latency), dan simulator beban transaksi burst.
          </p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 14px' }}>
          ● Server Optimal
        </span>
      </div>

      {/* Simulation Controller */}
      <div className="card">
        <div className="card-title">Simulator Beban Sistem (Transaction Burst Simulator)</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          Gunakan simulator ini untuk memicu ledakan transaksi pembayaran elektronik dalam jumlah besar. Ini akan mengevaluasi aturan fraud secara beruntun, melakukan enkripsi hybrid AES-256 + RSA secara simultan, dan menghasilkan log audit secara dinamis.
        </p>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="form-label" style={{ marginBottom: 0 }}>Jumlah Transaksi:</span>
            <input 
              type="number" 
              className="form-control" 
              style={{ width: '80px', padding: '6px' }}
              value={burstCount} 
              onChange={(e) => setBurstCount(parseInt(e.target.value))}
              min="1"
              max="200"
            />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleSimulate}
            disabled={simulating}
          >
            ⚡ Kirim Transaksi Burst
          </button>
        </div>
      </div>

      <div className="grid-half">
        {/* Latency Metrics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-title">Metrik Kecepatan Kriptografi (Latency)</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                <span>Rata-Rata Waktu Enkripsi (AES-256 + RSA)</span>
                <span className="mono-text" style={{ color: 'var(--accent-cyan)' }}>{metrics.avg_encryption_time_ms} ms</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((metrics.avg_encryption_time_ms / 5) * 100, 100)}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                <span>Rata-Rata Waktu Dekripsi (RSA + AES Decrypt)</span>
                <span className="mono-text" style={{ color: 'var(--accent-green)' }}>{metrics.avg_decryption_time_ms} ms</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((metrics.avg_decryption_time_ms / 10) * 100, 100)}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-green)', paddingLeft: '10px', marginTop: '10px' }}>
              ℹ️ Enkripsi hybrid menggunakan kunci RSA 2048-bit untuk membungkus kunci sesi AES-256. Waktu pemrosesan di bawah 1.5ms dikategorikan sangat cepat untuk pembayaran real-time.
            </div>
          </div>
        </div>

        {/* Server Hardware Telemetry */}
        <div className="card">
          <div className="card-title">Penggunaan Sumber Daya Server Backend</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0' }}>
            {/* CPU Gauge */}
            <div style={{ textAlign: 'center' }}>
              <svg width="100" height="100">
                <circle cx="50" cy="50" r={radius} stroke="var(--border-color)" strokeWidth={strokeWidth} fill="transparent" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  stroke="var(--accent-cyan)" 
                  strokeWidth={strokeWidth} 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={getStrokeDashOffset(metrics.cpu_usage)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="50%" y="55%" textAnchor="middle" fill="var(--text-primary)" fontSize="14px" fontWeight="bold" fontFamily="var(--font-mono)">
                  {metrics.cpu_usage}%
                </text>
              </svg>
              <div className="form-label" style={{ fontSize: '0.7rem', marginTop: '8px' }}>CPU Load</div>
            </div>

            {/* Memory Gauge */}
            <div style={{ textAlign: 'center' }}>
              <svg width="100" height="100">
                <circle cx="50" cy="50" r={radius} stroke="var(--border-color)" strokeWidth={strokeWidth} fill="transparent" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  stroke="var(--accent-amber)" 
                  strokeWidth={strokeWidth} 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={getStrokeDashOffset(metrics.memory_usage)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="50%" y="55%" textAnchor="middle" fill="var(--text-primary)" fontSize="14px" fontWeight="bold" fontFamily="var(--font-mono)">
                  {metrics.memory_usage}%
                </text>
              </svg>
              <div className="form-label" style={{ fontSize: '0.7rem', marginTop: '8px' }}>Memory RAM</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Koneksi Database Aktif:</span>
            <strong className="mono-text" style={{ color: 'var(--accent-cyan)' }}>{metrics.active_connections} Pool</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
