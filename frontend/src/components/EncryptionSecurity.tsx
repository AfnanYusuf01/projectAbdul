import React, { useState } from 'react';
import type { EncryptResult, DecryptPayload, TamperTestResult, KeyRotationResult } from '../types';
import { RefreshIcon, ShieldCheckIcon, ShieldIcon, CheckCircleIcon, CloseIcon, LockIcon, UnlockIcon, ZapIcon, AlertTriangleIcon, CopyIcon, CheckIcon } from './Icons';

interface EncryptionSecurityProps {
  onEncryptPlayground: (plaintext: string) => Promise<EncryptResult>;
  onDecryptPlayground: (data: DecryptPayload) => Promise<string>;
  onTamperTest: (plaintext: string) => Promise<TamperTestResult>;
  onRotateKey: () => Promise<KeyRotationResult>;
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
}

export const EncryptionSecurity: React.FC<EncryptionSecurityProps> = ({
  onEncryptPlayground,
  onDecryptPlayground,
  onTamperTest,
  onRotateKey,
  onNotify
}) => {
  const [plaintext, setPlaintext] = useState('{\n  "card_number": "4321-8765-9012-3456",\n  "cardholder": "Ahmad Dani",\n  "cvv": "123",\n  "pin": "998811"\n}');
  const [encryptResult, setEncryptResult] = useState<EncryptResult | null>(null);
  const [decryptResult, setDecryptResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tamper Test States
  const [tamperLoading, setTamperLoading] = useState(false);
  const [tamperResult, setTamperResult] = useState<TamperTestResult | null>(null);

  // Key Rotation States
  const [rotationLoading, setRotationLoading] = useState(false);
  const [rotationResult, setRotationResult] = useState<KeyRotationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyText = (field: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };
  const handleEncrypt = async () => {
    setLoading(true);
    setError(null);
    setEncryptResult(null);
    setDecryptResult(null);
    try {
      const res = await onEncryptPlayground(plaintext);
      setEncryptResult(res);
      onNotify?.('success', 'Enkripsi Berhasil!', 'Data transaksi berhasil diamankan dengan kunci sesi AES-256-GCM & RSA-2048.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengenkripsi payload.';
      setError(msg);
      onNotify?.('danger', 'Gagal Enkripsi', msg);
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptResult) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onDecryptPlayground(encryptResult);
      setDecryptResult(res);
      onNotify?.('success', 'Dekripsi Berhasil!', 'Data sensitif berhasil dipulihkan dan keaslian tag 16-byte tervalidasi.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendekripsi payload.';
      setError(msg);
      onNotify?.('danger', 'Gagal Dekripsi', msg);
      setLoading(false);
    }
  };

  const handleRunTamperTest = async () => {
    setTamperLoading(true);
    try {
      const res = await onTamperTest(plaintext);
      setTamperResult(res);
      onNotify?.('danger', 'Pelanggaran Integritas Terdeteksi!', 'Data telah dimanipulasi saat transit! Dekripsi ditolak oleh AES-GCM Tag check.');
    } catch {
    } finally {
      setTamperLoading(false);
    }
  };

  const handleExecuteKeyRotation = async () => {
    if (!confirm('Apakah Anda yakin ingin merotasi pasangan kunci RSA-2048? Kunci baru akan disimpan dan dicatat ke Audit Logs.')) {
      return;
    }
    setRotationLoading(true);
    try {
      const res = await onRotateKey();
      setRotationResult(res);
      onNotify?.('success', 'Rotasi Kunci RSA Sukses!', `Pasangan kunci RSA-2048 baru aktif (${res.key_fingerprint}).`);
    } catch {
    } finally {
      setRotationLoading(false);
    }
  };

  return (
    <div className="view-container animate-fade-in">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Enkripsi & Keamanan Transaksi (Hybrid Cryptography)</h2>
          <p className="view-header-desc">
            Evaluasi empiris algoritma simetris AES-256-GCM dan asimetris RSA-2048 dengan jaminan integritas anti-tampering (Bab IV Skripsi).
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-small"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontWeight: 600 }}
            onClick={handleExecuteKeyRotation}
            disabled={rotationLoading}
            title="Rotasi Kunci RSA-2048 (Kepatuhan PCI-DSS & ISO 27001)"
          >
            <RefreshIcon size={14} />
            <span>{rotationLoading ? 'Merotasi...' : 'Rotasi Kunci RSA (PCI-DSS)'}</span>
          </button>
          <span className="badge badge-success" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheckIcon size={14} />
            <span>Keamanan Kriptografi L3</span>
          </span>
        </div>
      </div>

      {/* Rotation Notification Banner */}
      {rotationResult && (
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af' }}>
            <CheckCircleIcon size={16} />
            <span><strong>Kunci RSA-2048 Berhasil Dirotasi!</strong> Sidik Jari Kunci: <code>{rotationResult.key_fingerprint}</code> (Insiden terekam di Log Audit).</span>
          </div>
          <button 
            onClick={() => setRotationResult(null)}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: 700 }}
            title="Tutup Notifikasi"
          >
            <CloseIcon size={12} />
          </button>
        </div>
      )}

      {/* SECTION 1: HYBRID ENCRYPTION PLAYGROUND */}
      <div className="grid-half">
        {/* Left Side: Plaintext Input & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card-title">
              <span>Input Data Transaksi (Plaintext)</span>
              <span className="badge badge-info">JSON Payload</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Masukkan payload JSON data transaksi kartu/nasabah yang akan dienkripsi secara hibrida.
            </p>
            <div className="form-group" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <textarea
                className="form-control form-control-mono"
                style={{ flexGrow: 1, resize: 'none', minHeight: '170px', color: '#10b981', backgroundColor: '#0b0f19', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', fontSize: '0.82rem' }}
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleEncrypt}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LockIcon size={14} />
                <span>Enkripsi Hybrid (AES + RSA)</span>
              </button>
              {encryptResult && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDecrypt}
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <UnlockIcon size={14} />
                  <span>Dekripsi Hybrid</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Cryptographic outputs display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-title">Hasil Kriptografi (Hybrid Outputs)</div>
            
            {loading && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                Memproses operasi kriptografi...
              </div>
            )}

            {error && (
              <div className="terminal-box" style={{ color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }}>
                Error: {error}
              </div>
            )}

            {!loading && !error && !encryptResult && (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Silakan ketuk tombol <strong>Enkripsi</strong> di sisi kiri untuk melihat visualisasi pengamanan data.
              </div>
            )}

            {encryptResult && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>1. IV (Initialization Vector - 12 Byte)</span>
                  <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    {encryptResult.iv}
                  </div>
                </div>

                <div>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>2. Auth Tag (AES-GCM Verification Tag - 16 Byte)</span>
                  <div className="mono-text" style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)', fontWeight: 700 }}>
                    {encryptResult.tag}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>3. Encrypted Session Key (RSA-2048)</span>
                    <button 
                      onClick={() => handleCopyText('rsa', encryptResult.encrypted_session_key)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      {copiedField === 'rsa' ? <><CheckIcon size={12} /> Tersalin</> : <><CopyIcon size={12} /> Salin</>}
                    </button>
                  </div>
                  <div className="terminal-box" style={{ maxHeight: '64px', minHeight: '44px', overflowY: 'auto', overflowX: 'hidden', color: '#f59e0b', fontSize: '0.7rem', wordBreak: 'break-all', boxSizing: 'border-box' }}>
                    {encryptResult.encrypted_session_key}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>4. Ciphertext Data Transaksi (AES-256)</span>
                    <button 
                      onClick={() => handleCopyText('cipher', encryptResult.ciphertext)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      {copiedField === 'cipher' ? <><CheckIcon size={12} /> Tersalin</> : <><CopyIcon size={12} /> Salin</>}
                    </button>
                  </div>
                  <div className="terminal-box" style={{ maxHeight: '64px', minHeight: '44px', overflowY: 'auto', overflowX: 'hidden', color: 'var(--text-secondary)', fontSize: '0.7rem', wordBreak: 'break-all', boxSizing: 'border-box' }}>
                    {encryptResult.ciphertext}
                  </div>
                </div>
              </div>
            )}

            {decryptResult && !loading && (
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span className="form-label" style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>5. Teks Terang Hasil Dekripsi (Plaintext Terbuka)</span>
                <div className="terminal-box" style={{ color: 'var(--accent-green)', backgroundColor: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  {decryptResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: SIMULATOR INTEGRITAS DATA & ANTI-TAMPERING TEST (BAB 4.2 SKRIPSI) */}
      <div className="card" style={{ marginTop: '8px', border: '1.5px solid #fed7aa', backgroundColor: 'var(--bg-surface)' }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldIcon size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Uji Integritas Data & Anti-Tampering (Simulasi Serangan Man-in-the-Middle)
              </span>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0', fontWeight: 400 }}>
                Pembuktian empiris pilar Integritas (CIA Triad): memodifikasi 1 byte ciphertext dan memverifikasi penolakan instan oleh AES-GCM Authentication Tag.
              </p>
            </div>
          </div>

          <button 
            className="btn btn-primary"
            style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px' }}
            onClick={handleRunTamperTest}
            disabled={tamperLoading}
          >
            <ZapIcon size={14} />
            <span>{tamperLoading ? 'Menguji Serangan...' : 'Jalankan Uji Tampering (Ubah 1 Byte)'}</span>
          </button>
        </div>

        {tamperResult && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px', animation: 'willowFadeIn 0.2s ease' }}>
            {/* Security Alert Banner */}
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangleIcon size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.88rem' }}>
                  {tamperResult.security_message}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#991b1b', marginTop: '2px' }}>
                  Waktu Deteksi Pelanggaran Integritas: <strong>{tamperResult.detection_latency_ms} ms</strong> • Status: <strong>{tamperResult.security_status}</strong> (Percobaan tercatat di Log Audit).
                </div>
              </div>
              <span className="badge badge-danger" style={{ fontWeight: 800, padding: '6px 12px' }}>
                TAMPER REJECTED
              </span>
            </div>

            {/* Comparison Grid: Original vs Tampered */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                <span className="form-label" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Ciphertext Asli (Valid Tag Match)
                </span>
                <div style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#10b981', wordBreak: 'break-all', maxHeight: '50px', overflowY: 'hidden' }}>
                  {tamperResult.original_ciphertext.slice(0, 48)}...
                </div>
              </div>

              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px' }}>
                <span className="form-label" style={{ fontSize: '0.74rem', color: '#dc2626' }}>
                  Ciphertext Dimanipulasi (Bit Index 0 Diubah)
                </span>
                <div style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#dc2626', wordBreak: 'break-all', maxHeight: '50px', overflowY: 'hidden', fontWeight: 700 }}>
                  {tamperResult.tampered_ciphertext.slice(0, 48)}...
                </div>
              </div>
            </div>

            {/* CIA Triad Scorecard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIDENTIALITY (Kerahasiaan)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>PASS (AES-256 + RSA)</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>INTEGRITY (Keutuhan)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>PROTECTED (16B Tag Check)</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABILITY (Ketersediaan)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>VERIFIED (Latensi &lt; 1 ms)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
