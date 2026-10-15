import React, { useState } from 'react';
import type { PerformanceMetrics } from '../types';
import { ZapIcon, FileSpreadsheetIcon } from './Icons';
interface PerformanceProps {
  metrics: PerformanceMetrics;
  onSimulate: (count: number) => Promise<void>;
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
}

export const Performance: React.FC<PerformanceProps> = ({
  metrics,
  onSimulate,
  onNotify
}) => {
  const [burstCount, setBurstCount] = useState(25);
  const [simulating, setSimulating] = useState(false);


  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await onSimulate(burstCount);
      onNotify?.('info', 'Simulasi Beban Dimulai', `Mengirimkan ${burstCount} transaksi simultan ke background server.`);
    } catch {
      onNotify?.('danger', 'Gagal Menjalankan Simulasi', 'Terjadi kesalahan saat memicu simulasi transaksi.');
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
    <div className="view-container animate-fade-in">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Performa & Telemetri Sistem (System Metrics)</h2>
          <p className="view-header-desc">
            Evaluasi empiris kecepatan komputasi kriptografi, utilisasi server, dan simulator beban kerja (Bab IV Skripsi).
          </p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 14px' }}>
          ● Server Optimal
        </span>
      </div>

      {/* Information Banner for Thesis Report Suite */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileSpreadsheetIcon size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e40af' }}>
              Pusat Evaluasi Akademik & Laporan Skripsi (Bab IV)
            </div>
            <div style={{ fontSize: '0.76rem', color: '#3b82f6' }}>
              Tolok ukur komparasi algoritma ilmiah (Bab 4.1), uji integritas (Bab 4.2), dan confusion matrix (Bab 4.3) kini dipusatkan pada menu khusus <strong>Laporan Evaluasi</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TELEMETRY & HARDWARE RESOURCE GRAPHS */}
      <div className="grid-half">
        {/* Latency Metrics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="card-title">Metrik Kecepatan Kriptografi Operasional (Real-time Latency)</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                <span>Rata-Rata Waktu Enkripsi (AES-256 + RSA)</span>
                <span className="mono-text" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{metrics.avg_encryption_time_ms} ms</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((metrics.avg_encryption_time_ms / 5) * 100, 100)}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                <span>Rata-Rata Waktu Dekripsi (RSA + AES Decrypt)</span>
                <span className="mono-text" style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{metrics.avg_decryption_time_ms} ms</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((metrics.avg_decryption_time_ms / 10) * 100, 100)}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-green)', paddingLeft: '10px', marginTop: '6px' }}>
              ℹ️ Enkripsi hybrid menggunakan kunci RSA 2048-bit untuk mengamankan kunci sesi AES-256. Waktu di bawah 1.5ms memenuhi SLA transaksi switching perbankan.
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

      {/* SECTION 3: TRANSACTION BURST SIMULATOR */}
      <div className="card" style={{ marginTop: '4px' }}>
        <div className="card-title">Simulator Beban Sistem (Transaction Burst Simulator)</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Gunakan simulator ini untuk memicu ledakan transaksi pembayaran elektronik dalam jumlah besar secara simultan guna menguji ketahanan throughput dan evaluasi aturan fraud beruntun.
        </p>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ZapIcon size={14} />
              <span>Kirim Transaksi Burst</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
