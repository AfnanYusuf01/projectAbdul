import React, { useState } from 'react';

interface EncryptionSecurityProps {
  onEncryptPlayground: (plaintext: string) => Promise<any>;
  onDecryptPlayground: (data: any) => Promise<string>;
}

export const EncryptionSecurity: React.FC<EncryptionSecurityProps> = ({ onEncryptPlayground, onDecryptPlayground }) => {
  const [plaintext, setPlaintext] = useState('{\n  "card_number": "4321-8765-9012-3456",\n  "cardholder": "Ahmad Dani",\n  "cvv": "123",\n  "pin": "998811"\n}');
  const [encryptResult, setEncryptResult] = useState<any | null>(null);
  const [decryptResult, setDecryptResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEncrypt = async () => {
    setLoading(true);
    setError(null);
    setEncryptResult(null);
    setDecryptResult(null);
    try {
      const res = await onEncryptPlayground(plaintext);
      setEncryptResult(res);
    } catch (err: any) {
      setError(err.message || 'Gagal mengenkripsi payload.');
    } finally {
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
    } catch (err: any) {
      setError(err.message || 'Gagal mendekripsi payload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Enkripsi & Keamanan Transaksi (Hybrid Cryptography)</h2>
          <p className="view-header-desc">
            Pengujian enkripsi muatan data (payload) sensitif menggunakan kombinasi algoritma simetris AES-256 dan asimetris RSA-2048.
          </p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 14px' }}>
          🛡️ Keamanan Kriptografi L3
        </span>
      </div>

      <div className="grid-half">
        {/* Left Side: Plaintext Input & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card-title">
              <span>Input Data Transaksi (Plaintext)</span>
              <span className="badge badge-info">JSON Payload</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Masukkan payload JSON atau data sensitif kartu/pelanggan yang akan dienkripsi secara hibrida.
            </p>
            <div className="form-group" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <textarea
                className="form-control form-control-mono"
                style={{ flexGrow: 1, resize: 'none', minHeight: '180px', color: '#10b981', backgroundColor: '#0b0f19', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px' }}
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleEncrypt}
                disabled={loading}
              >
                🔒 Enkripsi Hybrid (AES + RSA)
              </button>
              {encryptResult && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDecrypt}
                  disabled={loading}
                >
                  🔓 Dekripsi Hybrid
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>1. IV (Initialization Vector - AES)</span>
                  <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#05070c', padding: '6px', borderRadius: '4px' }}>
                    {encryptResult.iv}
                  </div>
                </div>

                <div>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>2. Auth Tag (GCM Verification Tag)</span>
                  <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#05070c', padding: '6px', borderRadius: '4px' }}>
                    {encryptResult.tag}
                  </div>
                </div>

                <div>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>3. Encrypted Session Key (Kunci Sesi Terbungkus RSA)</span>
                  <div className="terminal-box" style={{ maxHeight: '60px', color: 'var(--accent-amber)', fontSize: '0.7rem' }}>
                    {encryptResult.encrypted_session_key}
                  </div>
                </div>

                <div>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>4. Ciphertext Data Transaksi (Payload Terenkripsi AES-256)</span>
                  <div className="terminal-box" style={{ maxHeight: '60px', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {encryptResult.ciphertext}
                  </div>
                </div>
              </div>
            )}

            {decryptResult && !loading && (
              <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <span className="form-label" style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>5. Teks Terang Hasil Dekripsi (Plaintext Terbuka)</span>
                <div className="terminal-box" style={{ color: 'var(--accent-green)', backgroundColor: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  {decryptResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
