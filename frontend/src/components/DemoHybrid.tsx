import React, { useState, useEffect } from 'react';

interface DemoHybridProps {
  onEncrypt: (plaintext: string) => Promise<any>;
  onDecrypt: (data: any) => Promise<string>;
}

type SimStatus = 'idle' | 'encrypting' | 'sending' | 'decrypting' | 'success';

export const DemoHybrid: React.FC<DemoHybridProps> = ({ onEncrypt, onDecrypt }) => {
  // Input states
  const [customerId, setCustomerId] = useState('CUST-PLN-889');
  const [amount, setAmount] = useState('350000');
  const [channel, setChannel] = useState('QRIS');
  const [plaintext, setPlaintext] = useState('');

  // Simulation states
  const [status, setStatus] = useState<SimStatus>('idle');
  const [cryptoResult, setCryptoResult] = useState<any | null>(null);
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_loading, setLoading] = useState(false);

  // Update JSON plaintext representation whenever inputs change
  useEffect(() => {
    if (status === 'idle') {
      const payload = {
        customer_id: customerId,
        amount: parseFloat(amount) || 0,
        channel: channel,
        timestamp: new Date().toISOString()
      };
      setPlaintext(JSON.stringify(payload, null, 2));
    }
  }, [customerId, amount, channel, status]);

  // Handle the automatic flow of sending and decrypting
  useEffect(() => {
    if (status === 'sending') {
      const timer = setTimeout(() => {
        handleStartDecryption();
      }, 3000); // Transmission animation duration: 3 seconds
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Handler to start the encryption simulation (Client side)
  const handleStartSimulation = async () => {
    setStatus('encrypting');
    setLoading(true);
    setError(null);
    setCryptoResult(null);
    setDecryptedResult(null);

    try {
      // Add a small delay to make the encryption animation visible
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const result = await onEncrypt(plaintext);
      setCryptoResult(result);
      
      // Encryption success, transition to sending phase (triggers particle animation)
      setStatus('sending');
    } catch (err: any) {
      setError(err.message || 'Proses enkripsi gagal.');
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  // Handler to execute the decryption on Server side
  const handleStartDecryption = async () => {
    if (!cryptoResult) return;
    setStatus('decrypting');
    setLoading(true);

    try {
      // Add delay for server-side private key & AES processing animation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const decrypted = await onDecrypt(cryptoResult);
      setDecryptedResult(decrypted);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Proses dekripsi gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setCryptoResult(null);
    setDecryptedResult(null);
    setError(null);
  };

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Demo Interaktif Kriptografi Hibrida (AES + RSA)</h2>
          <p className="view-header-desc">
            Visualisasi transmisi data transaksi terenkripsi ujung-ke-ujung (Client-to-Server) secara real-time.
          </p>
        </div>
        <span className="badge badge-info" style={{ padding: '6px 14px' }}>
          🔒 AES-256-GCM + RSA-2048
        </span>
      </div>

      <div className="grid-half" style={{ flexGrow: 1 }}>
        {/* Left Side: Client Operator / Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card-title">
              <span>Sisi Client (Operator Keamanan)</span>
              {status === 'encrypting' ? (
                <span className="badge badge-warning pulse-red">🔒 ENCRYPTING...</span>
              ) : status === 'idle' ? (
                <span className="badge badge-info">Client Node</span>
              ) : (
                <span className="badge badge-success">🔒 DATA ENCRYPTED</span>
              )}
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Masukkan data transaksi Jatelindo. Sistem akan mengamankan data menggunakan Kriptografi Hibrida.
            </p>

            {/* Inputs are disabled during simulation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">ID Pelanggan (Customer ID)</label>
                <input
                  type="text"
                  className="form-control"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={status !== 'idle'}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nominal Transaksi (Rupiah)</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={status !== 'idle'}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Saluran Pembayaran (Channel)</label>
                <select
                  className="form-control"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  style={{ cursor: status === 'idle' ? 'pointer' : 'not-allowed' }}
                  disabled={status !== 'idle'}
                >
                  <option value="QRIS">QRIS</option>
                  <option value="Virtual Account">Virtual Account</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
            </div>

            {/* Terminal Box for Client Outputs */}
            <div className="form-group" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
              <label className="form-label">
                {status === 'idle' ? 'Payload Data Transaksi (Plaintext JSON)' : 'Log Kriptografi Client'}
              </label>
              
              {status === 'idle' ? (
                <textarea
                  className="form-control form-control-mono"
                  style={{ flexGrow: 1, resize: 'none', color: 'var(--accent-green)', background: '#05070c' }}
                  value={plaintext}
                  readOnly
                />
              ) : (
                <div className="terminal-box" style={{ flexGrow: 1 }}>
                  {status === 'encrypting' && (
                    <div style={{ color: 'var(--accent-amber)' }}>
                      [⚙️ SYS] Menyiapkan modul kriptografi hibrida...<br />
                      [🔑 AES] Membuat Session Key AES-256 sekali pakai secara acak...<br />
                      [🔒 AES] Mengenkripsi data transaksi JSON dengan AES-256-GCM...<br />
                      [🔑 RSA] Membaca Kunci Publik RSA-2048 Server...<br />
                      [🔒 RSA] Menyegel Session Key AES dengan Kunci Publik RSA...
                    </div>
                  )}
                  {cryptoResult && (
                    <div style={{ color: 'var(--accent-cyan)' }}>
                      [✓ OK ] Proses Enkripsi Selesai!<br /><br />
                      <span style={{ color: 'var(--text-secondary)' }}>=== DATA YANG AKAN DIKIRIM ===</span><br />
                      <strong>Plaintext:</strong> {plaintext.replace(/\n/g, '')}<br /><br />
                      <strong>AES Session Key (Plain):</strong> <span style={{ color: 'var(--accent-green)' }}>[HIDDEN / TEMPORARY]</span><br />
                      <strong>Encrypted Session Key (RSA):</strong> {cryptoResult.encrypted_session_key.slice(0, 60)}...<br /><br />
                      <strong>Ciphertext (AES-256):</strong> {cryptoResult.ciphertext.slice(0, 60)}...<br />
                      <strong>IV Vector:</strong> {cryptoResult.iv}<br />
                      <strong>GCM Tag:</strong> {cryptoResult.tag}<br />
                    </div>
                  )}
                  {error && (
                    <div style={{ color: 'var(--accent-red)' }}>
                      [❌ ERROR] {error}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              {status === 'idle' ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleStartSimulation} 
                  style={{ width: '100%' }}
                >
                  🚀 Kirim Transaksi (Mulai Demo Enkripsi)
                </button>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleReset} 
                  style={{ width: '100%' }}
                  disabled={status === 'encrypting'}
                >
                  🔄 Ulang Simulasi
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Network Flow Visualization & Server Jatelindo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Network Visualization Box */}
          <div className="card" style={{ minHeight: '220px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-title">
              <span>Visualisasi Aliran Jaringan (Client-to-Server)</span>
              <span className="badge badge-info">{status.toUpperCase()}</span>
            </div>

            {/* Client-to-Server diagram */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '400px', margin: 'auto', padding: '15px 0' }}>
              {/* Client Visual Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  border: `2px solid ${status !== 'idle' ? 'var(--accent-green)' : 'var(--accent-cyan)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-tertiary)',
                  boxShadow: `0 0 15px ${status !== 'idle' ? 'var(--accent-green-dim)' : 'var(--accent-cyan-dim)'}`,
                  fontSize: '1.5rem',
                  transition: 'all 0.3s ease'
                }}>
                  {status !== 'idle' ? '🔒' : '📱'}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>CLIENT</span>
              </div>

              {/* Connecting Line (SVG with Animated Motion Particles) */}
              <div style={{ flexGrow: 1, margin: '0 15px', position: 'relative', height: '30px' }}>
                <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  <path
                    d="M 0 15 L 100 15"
                    stroke={status === 'sending' ? 'var(--accent-cyan-dim)' : 'var(--border-color)'}
                    strokeWidth="3"
                    strokeDasharray={status === 'sending' ? 'none' : '5,5'}
                    fill="none"
                    style={{ transition: 'stroke 0.3s ease' }}
                  />
                  {status === 'sending' && (
                    <>
                      {/* Ciphertext particle (Cyan: AES Encrypted Data) */}
                      <circle r="5" fill="var(--accent-cyan)" filter="drop-shadow(0 0 4px var(--accent-cyan))">
                        <animateMotion dur="2.5s" repeatCount="1" path="M 0 15 L 100 15" fill="freeze" />
                      </circle>
                      {/* Encrypted Session Key particle (Amber: RSA Encrypted Key) */}
                      <circle r="5" fill="var(--accent-amber)" filter="drop-shadow(0 0 4px var(--accent-amber))">
                        <animateMotion dur="2.5s" begin="0.3s" repeatCount="1" path="M 0 15 L 100 15" fill="freeze" />
                      </circle>
                    </>
                  )}
                </svg>
                {status === 'sending' && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-cyan)'
                  }}>
                    TRANSMITTING HYBRID PAYLOAD...
                  </div>
                )}
              </div>

              {/* Server Visual Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  border: `2px solid ${status === 'success' ? 'var(--accent-green)' : status === 'decrypting' ? 'var(--accent-amber)' : 'var(--border-color)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-tertiary)',
                  boxShadow: status === 'success' 
                    ? '0 0 15px var(--accent-green-dim)' 
                    : status === 'decrypting' 
                    ? '0 0 15px var(--accent-amber-dim)' 
                    : 'none',
                  fontSize: '1.5rem',
                  transition: 'all 0.3s ease'
                }}>
                  {status === 'success' ? '🔓' : status === 'decrypting' ? '⚙️' : '🖥️'}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: status !== 'idle' && status !== 'encrypting' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>SERVER</span>
              </div>
            </div>
          </div>

          {/* Server Jatelindo Display Node */}
          <div className="card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card-title">
              <span>Sisi Server (PT Jatelindo)</span>
              {status === 'decrypting' ? (
                <span className="badge badge-warning pulse-red">🔓 DECRYPTING...</span>
              ) : status === 'success' ? (
                <span className="badge badge-success">✓ SECURED & VALID</span>
              ) : (
                <span className="badge badge-warning">Server Node</span>
              )}
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Data transaksi yang berhasil didekripsi oleh Server Jatelindo menggunakan modul Hybrid Cryptosystem.
            </p>

            <div className="terminal-box" style={{ flexGrow: 1, display: 'block', maxHeight: 'none' }}>
              {status === 'idle' || status === 'encrypting' ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Menunggu transmisi data transaksi...
                </div>
              ) : status === 'sending' ? (
                <div style={{ color: 'var(--accent-cyan)' }}>
                  [TRANS] Menerima paket data hybrid dari Client...<br />
                  [TRANS] Ciphertext payload (AES) terdeteksi.<br />
                  [TRANS] Encrypted session key (RSA) terdeteksi.<br />
                  [TRANS] Menunggu seluruh aliran paket data lengkap...
                </div>
              ) : status === 'decrypting' ? (
                <div style={{ color: 'var(--accent-amber)' }}>
                  [⚙️ SYS] Memulai proses dekripsi hybrid di server...<br />
                  [🔑 RSA] Membaca Kunci Privat RSA-2048 Server...<br />
                  [🔓 RSA] Mendekripsi Encrypted Session Key menggunakan Kunci Privat RSA...<br />
                  [🔑 AES] Kunci Sesi AES-256 berhasil dipulihkan!<br />
                  [🔓 AES] Mendekripsi Ciphertext menggunakan Kunci Sesi AES-256-GCM...
                </div>
              ) : (
                decryptedResult && (
                  <div style={{ color: 'var(--accent-green)' }}>
                    [✓ OK ] Dekripsi Sukses!<br />
                    [✓ OK ] Integritas Data Terjaga (100% Cocok)<br /><br />
                    <span style={{ color: 'var(--text-secondary)' }}>=== DECRYPTED PAYLOAD (PLAIN TEXT) ===</span><br />
                    <pre style={{ margin: '10px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                      {decryptedResult}
                    </pre>
                  </div>
                )
              )}
              {error && status === 'decrypting' && (
                <div style={{ color: 'var(--accent-red)' }}>
                  [❌ ERROR] Dekripsi Gagal: {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
