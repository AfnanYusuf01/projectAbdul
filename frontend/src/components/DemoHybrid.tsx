import React, { useState, useEffect, useRef } from 'react';
import './DemoHybrid.css';

interface DemoHybridProps {
  onEncrypt: (plaintext: string) => Promise<any>;
  onDecrypt: (data: any) => Promise<string>;
}

type SimStatus = 'idle' | 'encrypting' | 'transferring' | 'decrypting' | 'success';

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
  const [inspectorTab, setInspectorTab] = useState<'plaintext' | 'keys' | 'cipher' | 'decrypted'>('plaintext');
  const [currentTime, setCurrentTime] = useState('09:41');
  const [isLoopMode, setIsLoopMode] = useState(false);
  const [transferRunId, setTransferRunId] = useState(1);

  const timerRef = useRef<any>(null);

  // Update clock for phone status bars
  useEffect(() => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setCurrentTime(`${hrs}:${mins}`);
  }, []);

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

  // Handle flow transition: Transferring (5.5 detik koin meluncur) -> Decrypting -> Success
  useEffect(() => {
    if (status === 'transferring') {
      if (!isLoopMode) {
        // Beri waktu 5.5 detik agar pengguna dapat menikmati animasi koin dan data meluncur
        timerRef.current = setTimeout(() => {
          handleStartDecryption();
        }, 5500);
      }
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [status, isLoopMode]);

  // Start Transfer & Hybrid Encryption (Sender Phone)
  const handleStartTransfer = async () => {
    setTransferRunId(prev => prev + 1);
    setStatus('encrypting');
    setError(null);
    setCryptoResult(null);
    setDecryptedResult(null);

    try {
      // 1.2 detik jeda visual enkripsi pada ponsel pengirim
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const result = await onEncrypt(plaintext);
      setCryptoResult(result);

      // Mulai fase meluncurkan koin & paket data di sepanjang lengkungan
      setStatus('transferring');
    } catch (err: any) {
      setError(err.message || 'Proses enkripsi gagal.');
      setStatus('idle');
    }
  };

  // Start Decryption (Receiver Phone / Server Node)
  const handleStartDecryption = async () => {
    if (!cryptoResult) return;
    setStatus('decrypting');

    try {
      // 1.5 detik jeda visual dekripsi sebelum lingkaran centang hijau muncul
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const decrypted = await onDecrypt(cryptoResult);
      setDecryptedResult(decrypted);
      setStatus('success');
      setInspectorTab('decrypted');
    } catch (err: any) {
      setError(err.message || 'Proses dekripsi gagal.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('idle');
    setCryptoResult(null);
    setDecryptedResult(null);
    setError(null);
    setInspectorTab('plaintext');
  };

  return (
    <div className="view-container animate-fade-in">
      {/* Header & Page Title */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Demo Interaktif Transfer Kriptografi Hibrida (AES + RSA)</h2>
          <p className="view-header-desc">
            Visualisasi transaksi pembayaran: aliran koin emas dan paket data terenkripsi meluncur melengkung dari ponsel pengirim ke ponsel penerima.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-info" style={{ padding: '6px 14px' }}>
            🔒 AES-256-GCM + RSA-2048
          </span>
        </div>
      </div>

      <div className="crypto-demo-wrapper">
        {/* Step Progress Tracker Bar */}
        <div className="crypto-step-bar">
          <div className="crypto-step-list">
            <div className={`crypto-step-pill ${status === 'idle' ? 'active' : 'completed'}`}>
              <span>1. Pengirim (Input)</span>
            </div>
            <span className="crypto-step-separator">➔</span>

            <div className={`crypto-step-pill ${status === 'encrypting' ? 'active' : status !== 'idle' ? 'completed' : ''}`}>
              <span>2. Enkripsi (AES+RSA)</span>
            </div>
            <span className="crypto-step-separator">➔</span>

            <div className={`crypto-step-pill ${status === 'transferring' ? 'active' : (status === 'decrypting' || status === 'success') ? 'completed' : ''}`}>
              <span>3. Transfer Koin & Data</span>
            </div>
            <span className="crypto-step-separator">➔</span>

            <div className={`crypto-step-pill ${status === 'decrypting' ? 'active' : status === 'success' ? 'completed' : ''}`}>
              <span>4. Dekripsi Penerima</span>
            </div>
            <span className="crypto-step-separator">➔</span>

            <div className={`crypto-step-pill ${status === 'success' ? 'active completed' : ''}`}>
              <span>5. Berhasil (Valid ✓)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isLoopMode}
                onChange={(e) => setIsLoopMode(e.target.checked)}
              />
              <span>Loop Animasi (Terbang Terus)</span>
            </label>

            {status !== 'idle' && (
              <button className="btn btn-secondary btn-small" onClick={handleReset}>
                🔄 Ulang Simulasi
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 18px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: '12px', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ============================================================ */}
        {/* MAIN STAGE: SENDER PHONE -> ARCHED COIN FLIGHT -> RECEIVER   */}
        {/* ============================================================ */}
        <div className="transfer-stage">
          {/* Background Ambient Glows */}
          <div className="stage-bg-blob blob-left"></div>
          <div className="stage-bg-blob blob-right"></div>

          {/* ---------------------------------------------------------- */}
          {/* SISI KIRI: PONSEL PENGIRIM (SENDER PHONE)                  */}
          {/* ---------------------------------------------------------- */}
          <div className="phone-col">
            <div className={`phone-device ${status === 'encrypting' || status === 'transferring' ? 'active-glow-sender' : ''}`}>
              {/* Dynamic Island Notch */}
              <div className="phone-notch-bar">
                <div className="notch-speaker"></div>
                <div className="notch-camera"></div>
              </div>

              {/* Display Screen */}
              <div className="phone-display">
                {/* Status Bar */}
                <div className="phone-top-status sender-bar">
                  <span>{currentTime}</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="7" width="16" height="10" rx="2" />
                      <line x1="20" y1="11" x2="20" y2="13" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Sender Screen Content */}
                <div className="sender-screen-content">
                  {/* Virtual Credit / Debit Card */}
                  <div className="virtual-card">
                    <div className="card-chip-row">
                      <div className="sim-chip"></div>
                      <span className="card-bank-name">JATELINDO PAY</span>
                    </div>
                    <div className="card-number">•••• •••• •••• 8829</div>
                    <div className="card-holder-row">
                      <span>{customerId}</span>
                      <span>EXP 08/29</span>
                    </div>
                  </div>

                  {/* Input ID Pelanggan */}
                  <div className="sender-input-box">
                    <span className="sender-input-title">ID Rekening Pengirim</span>
                    <input
                      type="text"
                      className="sender-input-val"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      disabled={status !== 'idle'}
                      placeholder="e.g. CUST-PLN-889"
                    />
                  </div>

                  {/* Input Nominal */}
                  <div className="sender-input-box">
                    <span className="sender-input-title">Nominal Transfer (Rp)</span>
                    <input
                      type="number"
                      className="sender-input-val"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={status !== 'idle'}
                      placeholder="350000"
                    />
                  </div>

                  {/* Channel Selection */}
                  <div className="sender-input-box">
                    <span className="sender-input-title">Metode Pembayaran</span>
                    <select
                      className="sender-input-val"
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      disabled={status !== 'idle'}
                      style={{ cursor: status === 'idle' ? 'pointer' : 'not-allowed' }}
                    >
                      <option value="QRIS">QRIS Dinamis</option>
                      <option value="Virtual Account">Virtual Account</option>
                      <option value="E-Wallet">E-Wallet Jatelindo</option>
                      <option value="Credit Card">Kartu Kredit / Debit</option>
                    </select>
                  </div>

                  {/* Security Notice */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.66rem', color: '#64748b' }}>
                    <span>🔒</span>
                    <span>Dilindungi AES-256 + RSA-2048</span>
                  </div>

                  {/* Transfer Action Button */}
                  <button
                    className="btn-phone-transfer"
                    onClick={status === 'success' ? handleReset : handleStartTransfer}
                    disabled={status === 'encrypting' || status === 'transferring' || status === 'decrypting'}
                    style={status === 'success' ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
                  >
                    <span>{status === 'success' ? '✓' : '💸'}</span>
                    <span>
                      {status === 'idle'
                        ? 'TRANSFER SEKARANG'
                        : status === 'encrypting'
                        ? '🔒 MENYEGEL DATA...'
                        : status === 'transferring'
                        ? '🚀 MENGIRIMKAN DATA...'
                        : status === 'decrypting'
                        ? '⏳ MEMVERIFIKASI...'
                        : '✓ TRANSFER SELESAI (ULANGI)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              📱 PONSEL PENGIRIM (NASABAH)
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* BAGIAN TENGAH: LENGKUNGAN PARABOLA KOIN TERBANG (ARCH)     */}
          {/* ---------------------------------------------------------- */}
          <div className="transfer-highway-bridge">
            <div className="transfer-hud-badge">
              <span className="pulse-dot-green"></span>
              <span>
                {status === 'transferring'
                  ? '⚡ 5 PAKET DATA & KOIN SEDANG MELUNCUR...'
                  : status === 'decrypting'
                  ? '⚙️ PAKET TIBA DI PONSEL PENERIMA'
                  : status === 'success'
                  ? '✓ TRANSFER BERHASIL DITERIMA'
                  : 'JALUR TRANSFER TERENKRIPSI'}
              </span>
            </div>

            {/* SVG Canvas for Arched Path & Moving Flying Coins */}
            <svg className="arc-svg-canvas" viewBox="0 0 500 300">
              {/* Definition of Motion Path Curve */}
              <defs>
                <path id="parabolaFlightPath" d="M 30 250 Q 250 15 470 250" fill="none" />
                
                {/* 3D Gold Coin Gradient */}
                <radialGradient id="goldCoinGradient" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="45%" stopColor="#fbbf24" />
                  <stop offset="85%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </radialGradient>

                {/* 3D Cyan Token Gradient */}
                <radialGradient id="cyanTokenGradient" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#cffafe" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="85%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>

                {/* 3D Amber Token Gradient */}
                <radialGradient id="amberTokenGradient" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="85%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </radialGradient>
              </defs>

              {/* Glowing Background Laser Arc */}
              <path
                d="M 30 250 Q 250 15 470 250"
                fill="none"
                stroke={status === 'transferring' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(203, 213, 225, 0.25)'}
                strokeWidth={status === 'transferring' ? '12' : '6'}
                strokeLinecap="round"
              />

              {/* Arched Dotted Guide Line (Garis lengkung putus-putus seperti gambar) */}
              <path
                d="M 30 250 Q 250 15 470 250"
                fill="none"
                stroke={status === 'transferring' ? '#0284c7' : '#94a3b8'}
                strokeWidth="4"
                className={status === 'transferring' ? 'arc-active-stream' : ''}
                strokeDasharray="8 8"
                style={{ transition: 'stroke 0.3s ease' }}
              />

              {/* Sparkle stars along the arc */}
              <text x="120" y="80" fill="#f59e0b" fontSize="20" className="sparkle-star">✨</text>
              <text x="245" y="45" fill="#fde047" fontSize="26" className="sparkle-star" style={{ animationDelay: '0.4s' }}>★</text>
              <text x="370" y="80" fill="#f59e0b" fontSize="20" className="sparkle-star" style={{ animationDelay: '0.8s' }}>✨</text>

              {/* Static Preview Coins (When Idle or Success) */}
              {(status === 'idle' || status === 'success') && (
                <>
                  <g transform="translate(110, 115)">
                    <circle r="22" fill="url(#goldCoinGradient)" stroke="#fde68a" strokeWidth="2.5" />
                    <text x="0" y="7" textAnchor="middle" fill="#78350f" fontSize="15" fontWeight="900">Rp</text>
                  </g>
                  <g transform="translate(250, 60)">
                    <circle r="28" fill="url(#goldCoinGradient)" stroke="#fef08a" strokeWidth="3" />
                    <text x="0" y="8" textAnchor="middle" fill="#451a03" fontSize="20" fontWeight="900">$</text>
                  </g>
                  <g transform="translate(390, 115)">
                    <circle r="22" fill="url(#goldCoinGradient)" stroke="#fde68a" strokeWidth="2.5" />
                    <text x="0" y="7" textAnchor="middle" fill="#78350f" fontSize="15" fontWeight="900">Rp</text>
                  </g>
                </>
              )}

              {/* DYNAMIC CASCADE OF 5 GLOWING COINS & ENCRYPTED TOKENS (DURASI DIPERLAMBAT HINGGA 3.8s PER KOIN) */}
              {(status === 'transferring' || status === 'decrypting') && (
                <g key={`transfer-wave-${transferRunId}`}>
                  {/* Item 1: Leading Gold Coin (Rp) */}
                  <g className="coin-flying-group">
                    <circle r="26" fill="url(#goldCoinGradient)" stroke="#fff" strokeWidth="3.5" />
                    <circle r="20" fill="none" stroke="#78350f" strokeWidth="1.5" strokeDasharray="3 2" />
                    <text x="0" y="8" textAnchor="middle" fill="#451a03" fontSize="17" fontWeight="900">
                      Rp
                    </text>
                    <animateMotion
                      path="M 30 250 Q 250 15 470 250"
                      dur="3.8s"
                      repeatCount={isLoopMode ? "indefinite" : "2"}
                      fill="freeze"
                    />
                  </g>

                  {/* Item 2: Cyan Encrypted AES-256 Payload Capsule (offset delay 0.5s) */}
                  <g className="token-flying-aes">
                    <circle r="24" fill="url(#cyanTokenGradient)" stroke="#67e8f9" strokeWidth="2.5" />
                    <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                      🔒
                    </text>
                    <animateMotion
                      path="M 30 250 Q 250 15 470 250"
                      dur="3.8s"
                      begin="0.5s"
                      repeatCount={isLoopMode ? "indefinite" : "2"}
                      fill="freeze"
                    />
                  </g>

                  {/* Item 3: Center Mega Gold Coin ($ / Rupiah) (offset delay 1.1s) */}
                  <g className="coin-flying-group">
                    <circle r="29" fill="url(#goldCoinGradient)" stroke="#fef08a" strokeWidth="3.5" />
                    <circle r="22" fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 2" />
                    <text x="0" y="9" textAnchor="middle" fill="#78350f" fontSize="22" fontWeight="900">
                      $
                    </text>
                    <animateMotion
                      path="M 30 250 Q 250 15 470 250"
                      dur="3.8s"
                      begin="1.1s"
                      repeatCount={isLoopMode ? "indefinite" : "2"}
                      fill="freeze"
                    />
                  </g>

                  {/* Item 4: Amber RSA-2048 Digital Key Envelope (offset delay 1.6s) */}
                  <g className="token-flying-rsa">
                    <circle r="24" fill="url(#amberTokenGradient)" stroke="#fde68a" strokeWidth="2.5" />
                    <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                      🔑
                    </text>
                    <animateMotion
                      path="M 30 250 Q 250 15 470 250"
                      dur="3.8s"
                      begin="1.6s"
                      repeatCount={isLoopMode ? "indefinite" : "2"}
                      fill="freeze"
                    />
                  </g>

                  {/* Item 5: Trailing Gold Coin (Rp) (offset delay 2.1s) */}
                  <g className="coin-flying-group">
                    <circle r="25" fill="url(#goldCoinGradient)" stroke="#fffbeb" strokeWidth="3" />
                    <text x="0" y="7" textAnchor="middle" fill="#451a03" fontSize="16" fontWeight="900">
                      Rp
                    </text>
                    <animateMotion
                      path="M 30 250 Q 250 15 470 250"
                      dur="3.8s"
                      begin="2.1s"
                      repeatCount={isLoopMode ? "indefinite" : "2"}
                      fill="freeze"
                    />
                  </g>
                </g>
              )}
            </svg>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
              {status === 'transferring' ? (
                <span style={{ color: '#0284c7', fontWeight: 800 }}>
                  ⚡ Gelombang Koin & Paket Transaksi Terenkripsi Sedang Meluncur di Udara...
                </span>
              ) : (
                'Protokol Kriptografi Hibrida: Payload AES-256 + Kunci Sesi RSA-2048'
              )}
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* SISI KANAN: PONSEL PENERIMA (RECEIVER PHONE / MERCHANT)    */}
          {/* ---------------------------------------------------------- */}
          <div className="phone-col">
            <div className={`phone-device ${status === 'success' ? 'active-glow-receiver' : ''}`}>
              {/* Dynamic Island Notch */}
              <div className="phone-notch-bar">
                <div className="notch-speaker"></div>
                <div className="notch-camera"></div>
              </div>

              {/* Display Screen */}
              <div className="phone-display">
                {/* Status Bar */}
                <div className="phone-top-status receiver-bar">
                  <span>{currentTime}</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="7" width="16" height="10" rx="2" />
                      <line x1="20" y1="11" x2="20" y2="13" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Receiver Screen Content */}
                <div className="receiver-screen-content">
                  {status === 'idle' && (
                    <div className="receiver-waiting-box">
                      <div className="radar-spinner">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        Siap Menerima Transfer
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                        Menunggu koin & data dari ponsel pengirim.
                      </p>
                    </div>
                  )}

                  {(status === 'encrypting' || status === 'transferring') && (
                    <div className="receiver-waiting-box">
                      {/* Pulsing Landing Ripple Beacon */}
                      <div className="landing-beacon"></div>
                      <div className="radar-spinner" style={{ borderColor: '#f59e0b' }}>
                        <span style={{ fontSize: '1.6rem' }}>💰</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f59e0b' }}>
                        Menerima Koin & Data...
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                        Ciphertext AES-256 & Kunci Sesi RSA sedang mendarat.
                      </p>
                    </div>
                  )}

                  {status === 'decrypting' && (
                    <div className="receiver-waiting-box">
                      <div className="radar-spinner" style={{ borderColor: '#3b82f6' }}>
                        <span style={{ fontSize: '1.6rem' }}>⚙️</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#3b82f6' }}>
                        Mendekripsi Kunci & Data...
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                        Membuka segel RSA & memvalidasi integritas data.
                      </p>
                    </div>
                  )}

                  {/* SUCCESS STATE: LINGKARAN CENTANG HIJAU BESAR SEPERTI GAMBAR */}
                  {status === 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      {/* Big Green Circle with Checkmark */}
                      <div className="success-check-circle">
                        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>

                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10b981', marginBottom: '2px' }}>
                        TRANSFER BERHASIL!
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '12px' }}>
                        Koin Diterima & Data Tervalidasi 100%
                      </div>

                      {/* Transaction Receipt Card */}
                      <div className="success-receipt-card">
                        <div className="receipt-row">
                          <span className="receipt-key">Pengirim:</span>
                          <span className="receipt-val">{customerId}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-key">Nominal:</span>
                          <span className="receipt-val" style={{ color: '#0284c7' }}>
                            Rp {parseFloat(amount || '0').toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-key">Saluran:</span>
                          <span className="receipt-val">{channel}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-key">Status:</span>
                          <span className="receipt-val" style={{ color: '#10b981' }}>
                            ● LUNAS / TERVERIFIKASI
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              📱 PONSEL PENERIMA (MERCHANT / SOC)
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DETAIL INSPECTOR TABS: LIHAT STRUKTUR KRIPTOGRAFI HIBRIDA   */}
        {/* ============================================================ */}
        <div className="crypto-inspector">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              🔍 Inspektur Detail Kriptografi Hibrida (Under the Hood)
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Lihat bagaimana data diamankan saat terbang di udara
            </span>
          </div>

          {/* Inspector Tabs */}
          <div className="inspector-tabs-row">
            <button
              className={`inspector-btn ${inspectorTab === 'plaintext' ? 'active' : ''}`}
              onClick={() => setInspectorTab('plaintext')}
            >
              📄 1. Plaintext Asli (JSON)
            </button>
            <button
              className={`inspector-btn ${inspectorTab === 'keys' ? 'active' : ''}`}
              onClick={() => setInspectorTab('keys')}
            >
              🔑 2. Kunci Sesi & Segel RSA
            </button>
            <button
              className={`inspector-btn ${inspectorTab === 'cipher' ? 'active' : ''}`}
              onClick={() => setInspectorTab('cipher')}
            >
              🔒 3. Ciphertext, IV & Tag
            </button>
            <button
              className={`inspector-btn ${inspectorTab === 'decrypted' ? 'active' : ''}`}
              onClick={() => setInspectorTab('decrypted')}
            >
              ✓ 4. Hasil Dekripsi Penerima
            </button>
          </div>

          {/* Code Viewer Panel */}
          <div className="inspector-terminal">
            {inspectorTab === 'plaintext' && (
              <div>
                <span style={{ color: '#94a3b8' }}>// Data transaksi asli pada ponsel pengirim (sebelum enkripsi):</span><br />
                <pre style={{ margin: '8px 0 0 0', color: '#38bdf8' }}>{plaintext}</pre>
              </div>
            )}

            {inspectorTab === 'keys' && (
              <div>
                <span style={{ color: '#94a3b8' }}>// Mekanisme Kriptografi Hibrida Jatelindo:</span><br />
                <div style={{ color: '#fbbf24', marginTop: '6px' }}>
                  <strong>Kunci Sesi Simetris (AES-256):</strong> Kunci ephemeral yang dibuat acak untuk setiap transaksi.<br />
                  <strong>Kunci Asimetris (RSA-2048):</strong> Mengenkripsi kunci sesi AES di atas sehingga aman ditransmisikan.<br /><br />
                  {cryptoResult ? (
                    <>
                      <strong>Encrypted Session Key (Base64 RSA Envelope):</strong><br />
                      <span style={{ color: '#f59e0b', wordBreak: 'break-all' }}>
                        {cryptoResult.encrypted_session_key}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#64748b' }}>Klik "TRANSFER SEKARANG" untuk melihat segel kunci sesi.</span>
                  )}
                </div>
              </div>
            )}

            {inspectorTab === 'cipher' && (
              <div>
                <span style={{ color: '#94a3b8' }}>// Paket Ciphertext AES-256-GCM (Data yang meluncur di udara):</span><br />
                {cryptoResult ? (
                  <div style={{ marginTop: '8px', color: '#67e8f9' }}>
                    <strong>Ciphertext:</strong><br />
                    <span style={{ wordBreak: 'break-all', color: '#38bdf8' }}>{cryptoResult.ciphertext}</span><br /><br />
                    <strong>Initialization Vector (IV - 12 bytes):</strong> {cryptoResult.iv}<br />
                    <strong>Authentication Tag (GCM Tag - 16 bytes):</strong> {cryptoResult.tag}
                  </div>
                ) : (
                  <span style={{ color: '#64748b' }}>Belum ada data ciphertext yang dihasilkan.</span>
                )}
              </div>
            )}

            {inspectorTab === 'decrypted' && (
              <div>
                <span style={{ color: '#94a3b8' }}>// Hasil dekripsi pada ponsel penerima (telah divalidasi):</span><br />
                {decryptedResult ? (
                  <pre style={{ margin: '8px 0 0 0', color: '#34d399' }}>{decryptedResult}</pre>
                ) : (
                  <span style={{ color: '#64748b' }}>Penerima belum menerima atau mendekripsi transaksi.</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
