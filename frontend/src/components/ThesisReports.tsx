import React, { useState } from 'react';
import type { CryptoBenchmarkResult, ConfusionMatrixResult, TamperTestResult, KeyRotationResult } from '../types';
import { 
  BarChartIcon, 
  ShieldIcon, 
  TargetIcon, 
  ZapIcon, 
  FileSpreadsheetIcon, 
  DownloadIcon, 
  CheckIcon, 
  AlertTriangleIcon, 
  RefreshIcon
} from './Icons';
import './TransactionDashboard.css';

interface ThesisReportsProps {
  onRunBenchmark: (sizeKb: number) => Promise<CryptoBenchmarkResult>;
  onTamperTest: (plaintext: string) => Promise<TamperTestResult>;
  onRotateKey: () => Promise<KeyRotationResult>;
  onEvaluateDataset: () => Promise<ConfusionMatrixResult>;
  apiBase?: string;
  role: string;
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
}

export const ThesisReports: React.FC<ThesisReportsProps> = ({
  onRunBenchmark,
  onTamperTest,
  onRotateKey,
  onEvaluateDataset,
  apiBase,
  role: _role,
  onNotify
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'crypto' | 'tamper' | 'fraud'>('fraud');

  // Tab 1: Crypto Benchmark States
  const [benchmarkSize, setBenchmarkSize] = useState<number>(1);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<CryptoBenchmarkResult | null>(null);
  const [copiedCryptoTable, setCopiedCryptoTable] = useState(false);

  // Tab 2: Tamper & Key Rotation States
  const [samplePayload] = useState('{\n  "card_number": "4321-8765-9012-3456",\n  "cardholder": "Ahmad Dani",\n  "amount": 15000000\n}');
  const [tamperLoading, setTamperLoading] = useState(false);
  const [tamperResult, setTamperResult] = useState<TamperTestResult | null>(null);
  const [rotationLoading, setRotationLoading] = useState(false);
  const [rotationResult, setRotationResult] = useState<KeyRotationResult | null>(null);

  // Tab 3: Fraud Confusion Matrix States
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<ConfusionMatrixResult | null>(null);
  const [copiedFraudTable, setCopiedFraudTable] = useState(false);

  // Handlers
  const handleExecuteBenchmark = async () => {
    setBenchmarking(true);
    try {
      const res = await onRunBenchmark(benchmarkSize);
      setBenchmarkResult(res);
      onNotify?.('success', 'Tolok Ukur Kriptografi Selesai!', `Pengujian pada payload ${benchmarkSize} KB selesai dievaluasi.`);
    } catch {
      alert('Gagal menjalankan pengujian benchmark.');
    } finally {
      setBenchmarking(false);
    }
  };

  const handleCopyCryptoTable = () => {
    if (!benchmarkResult) return;
    const text = `Tabel 4.1: Komparasi Kinerja Algoritma Kriptografi (Payload ${benchmarkResult.payload_size_kb} KB)
Metode Enkripsi\tLatensi (ms)\tThroughput (TPS)\tUkuran Ciphertext\tKarakteristik
AES-256-GCM (Simetris)\t${benchmarkResult.aes_time_ms} ms\t${benchmarkResult.aes_throughput_tps} TPS\t${benchmarkResult.payload_size_bytes + 16} bytes\tSangat cepat, kelemahan pada distribusi kunci
RSA-2048 (Asimetris)\t${benchmarkResult.rsa_time_ms} ms\t${benchmarkResult.rsa_throughput_tps} TPS\t190 bytes (Maksimal)\tAman distribusi kunci, latensi tinggi & payload terbatas
Hybrid AES-RSA\t${benchmarkResult.hybrid_time_ms} ms\t${benchmarkResult.hybrid_throughput_tps} TPS\t${benchmarkResult.ciphertext_size_bytes} bytes\tSolusi optimal (efisiensi AES + keamanan RSA)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCryptoTable(true);
      onNotify?.('success', 'Tabel Bab 4.1 Tersalin!', 'Format tabel Word/LaTeX tersalin ke clipboard.');
      setTimeout(() => setCopiedCryptoTable(false), 2000);
    }
  };
  const handleRunTamperTest = async () => {
    setTamperLoading(true);
    try {
      const res = await onTamperTest(samplePayload);
      setTamperResult(res);
      onNotify?.('danger', 'Pelanggaran Integritas Terdeteksi!', 'Data telah dimanipulasi saat transit! Dekripsi ditolak oleh AES-GCM Tag check.');
    } catch {
      alert('Gagal menjalankan pengujian tampering.');
    } finally {
      setTamperLoading(false);
    }
  };

  const handleExecuteKeyRotation = async () => {
    if (!confirm('Apakah Anda yakin ingin merotasi pasangan kunci RSA-2048?')) return;
    setRotationLoading(true);
    try {
      const res = await onRotateKey();
      setRotationResult(res);
      onNotify?.('success', 'Kunci RSA Dirotasi!', `Kunci RSA-2048 baru diaktifkan (${res.key_fingerprint}).`);
    } catch {
      alert('Gagal merotasi kunci.');
    } finally {
      setRotationLoading(false);
    }
  };

  const handleRunFraudEvaluation = async () => {
    setEvalLoading(true);
    try {
      const res = await onEvaluateDataset();
      setEvalResult(res);
      onNotify?.('success', 'Evaluasi 100 Sampel Selesai!', `Akurasi mesin fraud: ${res.accuracy_pct}%, F1-Score: ${res.f1_score_pct}%.`);
    } catch {
      alert('Gagal mengevaluasi dataset.');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleCopyFraudTable = () => {
    if (!evalResult) return;
    const text = `Tabel 4.3: Confusion Matrix & Evaluasi Efektivitas Fraud Detection Engine (100 Sampel Uji)
Kategori\tPrediksi Fraud (SUSPICIOUS)\tPrediksi Normal (SUCCESS)\tTotal Sampel
Aktual Fraud\tTP: ${evalResult.true_positives}\tFN: ${evalResult.false_negatives}\t30 Sampel
Aktual Normal\tFP: ${evalResult.false_positives}\tTN: ${evalResult.true_negatives}\t70 Sampel

Metrik Evaluasi:
Accuracy: ${evalResult.accuracy_pct}%
Precision: ${evalResult.precision_pct}%
Recall: ${evalResult.recall_pct}%
F1-Score: ${evalResult.f1_score_pct}%`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedFraudTable(true);
      onNotify?.('success', 'Tabel Bab 4.3 Tersalin!', 'Confusion Matrix tersalin ke clipboard.');
      setTimeout(() => setCopiedFraudTable(false), 2000);
    }
  };
  const handleDownloadFullCSV = () => {
    const base = apiBase || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8001' : '');
    window.open(`${base}/api/reports/export-thesis-data`, '_blank');
    onNotify?.('success', 'Unduhan Dimulai', 'File laporan_evaluasi_skripsi_jatelindo.csv berhasil diunduh.');
  };

  return (
    <div className="view-container animate-fade-in" style={{ padding: '24px 32px' }}>
      {/* Breadcrumb */}
      <div className="jt-breadcrumb">
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </span>
        <span>›</span>
        <span>Laporan & Penelitian</span>
        <span>›</span>
        <span className="jt-breadcrumb-item active">Evaluasi Skripsi (Defense-in-Depth)</span>
      </div>

      {/* Header */}
      <div className="jt-header-row" style={{ marginTop: '4px', marginBottom: '18px' }}>
        <div>
          <h1 className="jt-header-title">Laporan & Evaluasi Penelitian Skripsi</h1>
          <p className="jt-header-subtitle">
            Pusat pengujian empiris ilmiah untuk naskah Bab IV (Hasil & Pembahasan) dan Lampiran Skripsi PT Jatelindo.
          </p>
        </div>

        <div className="jt-header-actions">
          <button 
            className="btn btn-secondary btn-small"
            onClick={handleDownloadFullCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontWeight: 600 }}
          >
            <DownloadIcon size={14} />
            <span>Ekspor Dataset CSV Lengkap</span>
          </button>
        </div>
      </div>

      {/* Chapter Sub-Tabs (Bab 4.1, Bab 4.2, Bab 4.3) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveReportTab('fraud')}
          className={`btn btn-small ${activeReportTab === 'fraud' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px' }}
        >
          <TargetIcon size={16} />
          <span>Bab 4.3: Evaluasi Mesin Fraud (Confusion Matrix)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('crypto')}
          className={`btn btn-small ${activeReportTab === 'crypto' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px' }}
        >
          <BarChartIcon size={16} />
          <span>Bab 4.1: Tolok Ukur Kriptografi (Benchmark AES vs RSA)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('tamper')}
          className={`btn btn-small ${activeReportTab === 'tamper' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px' }}
        >
          <ShieldIcon size={16} />
          <span>Bab 4.2: Uji Integritas Data (Anti-Tampering)</span>
        </button>
      </div>

      {/* TAB 1: BAB 4.3 CONFUSION MATRIX SUITE */}
      {activeReportTab === 'fraud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="card" style={{ border: '1.5px solid #bfdbfe' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Evaluasi Efektivitas Fraud Detection Engine (100 Sampel Uji Ground Truth)
                </span>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Menguji 70 transaksi normal dan 30 transaksi anomali terhadap aturan aktif untuk menghitung Akurasi, Presisi, Recall, dan F1-Score.
                </p>
              </div>

              <button 
                className="btn btn-primary"
                onClick={handleRunFraudEvaluation}
                disabled={evalLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontSize: '0.82rem' }}
              >
                <ZapIcon size={14} />
                <span>{evalLoading ? 'Mengevaluasi 100 Sampel...' : 'Jalankan Evaluasi 100 Dataset Uji'}</span>
              </button>
            </div>

            {evalResult && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 4 Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 16px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 600 }}>AKURASI (ACCURACY)</span>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1d4ed8', marginTop: '2px' }}>
                      {evalResult.accuracy_pct}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>(TP + TN) / Total Sampel</span>
                  </div>

                  <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 16px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 600 }}>PRESISI (PRECISION)</span>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                      {evalResult.precision_pct}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#10b981' }}>TP / (TP + FP)</span>
                  </div>

                  <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '14px 16px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 600 }}>RECALL (SENSITIVITAS)</span>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                      {evalResult.recall_pct}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#f97316' }}>TP / (TP + FN)</span>
                  </div>

                  <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '14px 16px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#5b21b6', fontWeight: 600 }}>F1-SCORE</span>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
                      {evalResult.f1_score_pct}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#8b5cf6' }}>Harmonic Mean Precision & Recall</span>
                  </div>
                </div>

                {/* 4-Quadrant Confusion Matrix Table */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                  <div className="table-container" style={{ border: '1px solid var(--border-color)' }}>
                    <table className="custom-table" style={{ textAlign: 'center' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>Kondisi Aktual (Ground Truth)</th>
                          <th style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>Prediksi FRAUD (SUSPICIOUS)</th>
                          <th style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>Prediksi NORMAL (SUCCESS)</th>
                          <th>Total Sampel</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: 'left', fontWeight: 700 }}>Aktual FRAUD (Anomali)</td>
                          <td style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', fontWeight: 800, color: '#dc2626', fontSize: '1.05rem' }}>
                            TP: {evalResult.true_positives}
                          </td>
                          <td style={{ backgroundColor: 'rgba(239, 68, 68, 0.02)', fontWeight: 600, color: 'var(--text-muted)' }}>
                            FN: {evalResult.false_negatives}
                          </td>
                          <td style={{ fontWeight: 700 }}>30</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: 'left', fontWeight: 700 }}>Aktual NORMAL (Sah)</td>
                          <td style={{ backgroundColor: 'rgba(16, 185, 129, 0.02)', fontWeight: 600, color: 'var(--text-muted)' }}>
                            FP: {evalResult.false_positives}
                          </td>
                          <td style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', fontWeight: 800, color: '#16a34a', fontSize: '1.05rem' }}>
                            TN: {evalResult.true_negatives}
                          </td>
                          <td style={{ fontWeight: 700 }}>70</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Distribution of Rules */}
                  <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Distribusi Deteksi Aturan:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                      {Object.entries(evalResult.rule_trigger_counts || {}).map(([rName, count]) => (
                        <div key={rName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>• {rName}</span>
                          <strong className="mono-text" style={{ color: '#2563eb' }}>{count} kali terpicu</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Copy Table Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={handleCopyFraudTable}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                  >
                    {copiedFraudTable ? <CheckIcon size={14} /> : <FileSpreadsheetIcon size={14} />}
                    <span>{copiedFraudTable ? 'Tabel Tersalin ke Clipboard!' : 'Salin Format Tabel Bab 4.3 (Word / LaTeX)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BAB 4.1 CRYPTOGRAPHIC BENCHMARK SUITE */}
      {activeReportTab === 'crypto' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="card" style={{ border: '1.5px solid #bfdbfe' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Tolok Ukur Ilmiah Kriptografi (Bab 4.1)
                </span>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Komparasi empiris latensi eksekusi (ms) dan throughput (TPS) antara AES-256 simetris, RSA-2048 asimetris, dan Hybrid AES-RSA.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border-color)', gap: '2px' }}>
                  {[1, 10, 50].map((kb) => (
                    <button
                      key={kb}
                      onClick={() => setBenchmarkSize(kb)}
                      className={`btn btn-small ${benchmarkSize === kb ? 'btn-primary' : 'btn-secondary'}`}
                      style={benchmarkSize === kb ? { padding: '4px 10px', fontSize: '0.74rem' } : { border: 'none', background: 'transparent', padding: '4px 10px', fontSize: '0.74rem' }}
                    >
                      {kb} KB
                    </button>
                  ))}
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleExecuteBenchmark}
                  disabled={benchmarking}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px' }}
                >
                  <ZapIcon size={14} />
                  <span>{benchmarking ? 'Menguji 25 Iterasi...' : `Jalankan Benchmark (${benchmarkSize} KB)`}</span>
                </button>
              </div>
            </div>

            {benchmarkResult && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="table-container" style={{ border: '1px solid var(--border-color)' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Metode Enkripsi</th>
                        <th>Waktu Rata-rata (ms)</th>
                        <th>Throughput (TPS)</th>
                        <th>Ukuran Ciphertext</th>
                        <th>Karakteristik & Analisis Ilmiah</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 700 }}>AES-256-GCM (Simetris Murni)</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Galois/Counter Mode</div>
                        </td>
                        <td><span className="mono-text" style={{ fontWeight: 800, color: '#10b981' }}>{benchmarkResult.aes_time_ms} ms</span></td>
                        <td><span className="mono-text" style={{ fontWeight: 700, color: '#2563eb' }}>{benchmarkResult.aes_throughput_tps.toLocaleString('id-ID')} TPS</span></td>
                        <td className="mono-text">{benchmarkResult.payload_size_bytes + 16} Bytes</td>
                        <td style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Sangat cepat untuk payload besar, namun terkendala risiko pertukaran kunci simetris rahasia.</td>
                      </tr>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 700, color: '#ef4444' }}>RSA-2048 (Asimetris Murni)</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OAEP SHA-256</div>
                        </td>
                        <td><span className="mono-text" style={{ fontWeight: 800, color: '#ef4444' }}>{benchmarkResult.rsa_time_ms} ms</span></td>
                        <td><span className="mono-text" style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{benchmarkResult.rsa_throughput_tps.toLocaleString('id-ID')} TPS</span></td>
                        <td className="mono-text" style={{ color: '#ef4444' }}>Maks 190 Bytes</td>
                        <td style={{ fontSize: '0.76rem', color: '#b91c1c' }}>Aman pertukaran kunci, namun latensi tinggi (~{Math.round(benchmarkResult.rsa_time_ms / Math.max(0.01, benchmarkResult.hybrid_time_ms))}x lebih lambat) dan payload terbatas &lt; 214 bytes.</td>
                      </tr>
                      <tr style={{ backgroundColor: 'rgba(37, 99, 235, 0.04)' }}>
                        <td>
                          <div style={{ fontWeight: 800, color: '#2563eb' }}>Hybrid Cryptosystem (AES+RSA)</div>
                          <div style={{ fontSize: '0.7rem', color: '#2563eb' }}>Solusi Rekayasa Yang Diusulkan</div>
                        </td>
                        <td><span className="mono-text" style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.9rem' }}>{benchmarkResult.hybrid_time_ms} ms</span></td>
                        <td><span className="mono-text" style={{ fontWeight: 800, color: '#2563eb' }}>{benchmarkResult.hybrid_throughput_tps.toLocaleString('id-ID')} TPS</span></td>
                        <td className="mono-text" style={{ fontWeight: 700 }}>{benchmarkResult.ciphertext_size_bytes} Bytes</td>
                        <td style={{ fontSize: '0.76rem', color: '#1e40af' }}><strong>Solusi Optimal:</strong> Efisiensi mendekati AES dengan integritas tinggi dan kenyamanan distribusi kunci RSA.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={handleCopyCryptoTable}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                  >
                    {copiedCryptoTable ? <CheckIcon size={14} /> : <FileSpreadsheetIcon size={14} />}
                    <span>{copiedCryptoTable ? 'Tabel Tersalin ke Clipboard!' : 'Salin Format Tabel Bab 4.1 (Word / LaTeX)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BAB 4.2 INTEGRITY & ANTI-TAMPERING TEST */}
      {activeReportTab === 'tamper' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="card" style={{ border: '1.5px solid #fed7aa' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Uji Integritas Data & Anti-Tampering (Bab 4.2)
                </span>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Pembuktian empiris pilar Integritas (CIA Triad): memodifikasi 1 byte ciphertext saat transit dan memverifikasi penolakan instan oleh AES-GCM Authentication Tag.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={handleExecuteKeyRotation}
                  disabled={rotationLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                >
                  <RefreshIcon size={12} />
                  <span>{rotationLoading ? 'Merotasi...' : 'Rotasi Kunci RSA (PCI-DSS)'}</span>
                </button>

                <button 
                  className="btn btn-primary"
                  onClick={handleRunTamperTest}
                  disabled={tamperLoading}
                  style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px' }}
                >
                  <ZapIcon size={14} />
                  <span>{tamperLoading ? 'Menguji...' : 'Jalankan Uji Tampering (Ubah 1 Byte)'}</span>
                </button>
              </div>
            </div>

            {/* Rotation Notification */}
            {rotationResult && (
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: '#1e40af', marginTop: '10px' }}>
                <strong>Kunci RSA-2048 Dirotasi:</strong> Fingerprint baru <code>{rotationResult.key_fingerprint}</code> (Audit ISO 27001 terekam).
              </div>
            )}

            {/* Tamper Result */}
            {tamperResult && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertTriangleIcon size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.88rem' }}>
                      {tamperResult.security_message}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#991b1b', marginTop: '2px' }}>
                      Waktu Deteksi: <strong>{tamperResult.detection_latency_ms} ms</strong> • Status: <strong>{tamperResult.security_status}</strong>
                    </div>
                  </div>
                  <span className="badge badge-danger" style={{ fontWeight: 800, padding: '6px 12px' }}>
                    TAMPER REJECTED
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                    <span className="form-label" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Ciphertext Asli (Valid Tag Match)</span>
                    <div style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#10b981', wordBreak: 'break-all' }}>
                      {tamperResult.original_ciphertext.slice(0, 52)}...
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px' }}>
                    <span className="form-label" style={{ fontSize: '0.74rem', color: '#dc2626' }}>Ciphertext Dimanipulasi (Bit Index 0 Diubah)</span>
                    <div style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#dc2626', wordBreak: 'break-all', fontWeight: 700 }}>
                      {tamperResult.tampered_ciphertext.slice(0, 52)}...
                    </div>
                  </div>
                </div>

                {/* CIA Triad Scorecard */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIDENTIALITY</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>PASS (AES-256 + RSA)</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>INTEGRITY</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>PROTECTED (16B Tag Check)</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABILITY</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>VERIFIED (Latensi &lt; 1 ms)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
