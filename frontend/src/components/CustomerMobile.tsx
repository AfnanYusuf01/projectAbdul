import React, { useState } from 'react';
import './CustomerMobile.css';

interface CustomerMobileProps {
  onSendTransaction: (txData: { customer_id: string, amount: number, channel: string }) => Promise<any>;
  mockRules: any[];
}

type SimStatus = 'idle' | 'processing' | 'success' | 'declined';

export const CustomerMobile: React.FC<CustomerMobileProps> = ({ onSendTransaction, mockRules: _mockRules }) => {
  // Input states
  const [transactionType, setTransactionType] = useState('QRIS');
  const [amount, setAmount] = useState('150000');
  const [recipient, setRecipient] = useState('JAT-QRIS-9928');

  // Simulator states
  const [status, setStatus] = useState<SimStatus>('idle');
  const [balance, setBalance] = useState(50000000); // 50 Million Rupiah
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([
    { id: 1, desc: 'Transfer Virtual Account', date: 'Hari ini, 14:20', amount: '- Rp 120.000', type: 'out' },
    { id: 2, desc: 'Top Up LinkAja', date: 'Kemarin, 09:15', amount: '- Rp 50.000', type: 'out' },
    { id: 3, desc: 'Terima Transfer', date: '25 Agt, 18:04', amount: '+ Rp 500.000', type: 'in' }
  ]);

  const handlePay = async () => {
    setErrorMsg(null);
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Masukkan nominal transaksi yang valid.');
      return;
    }
    if (parsedAmount > balance) {
      setErrorMsg('Saldo Anda tidak mencukupi untuk melakukan transaksi ini.');
      return;
    }

    setStatus('processing');

    try {
      // Visual delay for the Jatelindo Pay secure processing animation (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const txData = {
        customer_id: recipient || 'CUST-DEFAULT',
        amount: parsedAmount,
        channel: transactionType
      };

      const res = await onSendTransaction(txData);
      setLastTx(res);

      if (res.status === 'SUSPICIOUS') {
        setStatus('declined');
      } else {
        // Success: subtract balance
        setBalance(prev => prev - parsedAmount);
        
        // Add to history
        const newHistoryItem = {
          id: Date.now(),
          desc: `${transactionType} ke ${recipient.slice(0, 12)}`,
          date: 'Baru saja',
          amount: `- Rp ${parsedAmount.toLocaleString('id-ID')}`,
          type: 'out'
        };
        setHistory([newHistoryItem, ...history]);
        setStatus('success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Transaksi gagal.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setAmount('150000');
    setRecipient(transactionType === 'QRIS' ? 'JAT-QRIS-9928' : transactionType === 'Tagihan PLN' ? '5321870912' : 'JAT-VA-8829');
    setErrorMsg(null);
  };

  const handleTypeChange = (newType: string) => {
    setTransactionType(newType);
    if (newType === 'QRIS') {
      setRecipient('JAT-QRIS-9928');
    } else if (newType === 'Tagihan PLN') {
      setRecipient('5321870912');
    } else if (newType === 'Virtual Account') {
      setRecipient('8802998811');
    } else {
      setRecipient('4321876590');
    }
  };

  const setScenarioNormal = () => {
    setAmount('150000');
    setTransactionType('QRIS');
    setRecipient('JAT-QRIS-9928');
    setStatus('idle');
    setErrorMsg(null);
  };

  const setScenarioFraud = () => {
    setAmount('15000000');
    setTransactionType('QRIS');
    setRecipient('JAT-QRIS-9928');
    setStatus('idle');
    setErrorMsg(null);
  };

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="view-header-title">Aplikasi Mobile Nasabah (Jatelindo Pay)</h2>
          <p className="view-header-desc">
            Simulator perangkat smartphone nasabah untuk pengujian pembayaran instan dan validasi deteksi fraud real-time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-small" onClick={setScenarioNormal}>
            🟢 Isi Normal (Rp 150.000)
          </button>
          <button className="btn btn-danger btn-small" onClick={setScenarioFraud}>
            🔴 Isi Fraud (Rp 15.000.000)
          </button>
        </div>
      </div>

      <div className="grid-half" style={{ alignItems: 'start' }}>
        {/* Left Side: Simulation Guide & Fraud Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-title">
              <span>Panduan Skenario Transaksi</span>
              <span className="badge badge-info">Simulator Aktif</span>
            </div>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                Gunakan mockup smartphone interaktif di samping kanan untuk menguji respon sistem keamanan transaksi Jatelindo.
              </p>

              <div style={{
                backgroundColor: 'var(--accent-green-bg)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🟢 Skenario Normal (Lolos)
                  </strong>
                  <button className="btn btn-secondary btn-small" style={{ fontSize: '0.7rem', padding: '3px 8px' }} onClick={setScenarioNormal}>
                    Pilih
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>
                  Nominal di bawah batas threshold (misal <strong>Rp 150.000</strong>). Transaksi akan berhasil dan memunculkan resi digital hijau di layar HP.
                </p>
              </div>

              <div style={{
                backgroundColor: 'var(--accent-red-bg)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔴 Skenario Fraud (Diblokir)
                  </strong>
                  <button className="btn btn-danger btn-small" style={{ fontSize: '0.7rem', padding: '3px 8px' }} onClick={setScenarioFraud}>
                    Pilih
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Nominal melebihi batas batas fraud (misal <strong>Rp 15.000.000</strong>):
                </p>
                <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Layar HP mendeteksi penolakan instan (<strong>Transaksi Ditolak</strong>).</li>
                  <li>Transaksi tercatat sebagai <code>SUSPICIOUS</code> di backend.</li>
                  <li>Notifikasi peringatan otomatis terkirim ke menu <strong>Alert Fraud</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Smartphone Device Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Smartphone Outer Container */}
          <div className="phone-wrapper">
            {/* Smartphone Bezel / Frame */}
            <div className="phone-bezel">
              {/* Speaker & Camera Notch */}
              <div className="phone-notch">
                <div className="phone-speaker"></div>
                <div className="phone-camera"></div>
              </div>

              {/* Smartphone Screen Content */}
              <div className="phone-screen">
                {/* Status Bar */}
                <div className="phone-status-bar">
                  <span className="phone-time">22:28</span>
                  <div className="phone-status-icons">
                    <span>📶</span>
                    <span>📶</span>
                    <span>🔋 85%</span>
                  </div>
                </div>

                {/* Jatelindo Pay App Header */}
                <div className="app-header">
                  <div className="app-brand">
                    <span className="app-brand-dot"></span>
                    <span>Jatelindo<span style={{ fontWeight: 800 }}>Pay</span></span>
                  </div>
                  <div className="user-profile">
                    <div className="user-avatar">👤</div>
                    <div className="user-info">
                      <div className="user-greeting">Halo,</div>
                      <div className="user-name">Ahmad Dani</div>
                    </div>
                  </div>
                  
                  {/* Balance Card */}
                  <div className="balance-card">
                    <span className="balance-label">Saldo JatelindoPay</span>
                    <span className="balance-value">Rp {balance.toLocaleString('id-ID')}</span>
                    <span className="balance-promo">⭐ Premium Member</span>
                  </div>
                </div>

                {/* App Scrollable Content */}
                <div className="app-content">
                  {/* Inline Error Message */}
                  {errorMsg && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      fontSize: '0.65rem',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      textAlign: 'center',
                      fontWeight: 600
                    }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {/* Form Transaksi */}
                  <div className="mobile-section-title">Kirim Pembayaran</div>
                  <div className="mobile-card">
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.65rem', color: '#4b5563' }}>Metode Pembayaran</label>
                      <select
                        className="form-control"
                        value={transactionType}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db' }}
                      >
                        <option value="QRIS">QRIS Payment</option>
                        <option value="Tagihan PLN">Tagihan Listrik PLN</option>
                        <option value="Virtual Account">Virtual Account</option>
                        <option value="Credit Card">Credit Card</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.65rem', color: '#4b5563' }}>Nominal (Rupiah)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Rp 0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label" style={{ fontSize: '0.65rem', color: '#4b5563' }}>No. Tujuan / ID Pelanggan</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Masukkan nomor..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db' }}
                      />
                    </div>

                    <button 
                      className="btn btn-primary" 
                      onClick={handlePay}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', background: '#2563eb', color: '#ffffff', borderRadius: '8px', boxShadow: 'none' }}
                    >
                      💳 Bayar Sekarang
                    </button>
                  </div>

                  {/* Riwayat Transaksi */}
                  <div className="mobile-section-title" style={{ marginTop: '15px' }}>Riwayat Transaksi</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px' }}>
                    {history.map((h) => (
                      <div key={h.id} className="history-item">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="history-desc">{h.desc}</span>
                          <span className="history-date">{h.date}</span>
                        </div>
                        <span className={`history-amount ${h.type === 'in' ? 'amount-in' : 'amount-out'}`}>
                          {h.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROCESSING OVERLAY SCREEN */}
                {status === 'processing' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    borderRadius: '26px',
                    color: '#1d4ed8'
                  }}>
                    <div className="phone-spinner" style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '4px solid #e5e7eb',
                      borderTopColor: '#2563eb',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '15px'
                    }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>Memproses Pembayaran...</span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '5px' }}>Mengamankan dengan AES-256</span>
                  </div>
                )}

                {/* SUCCESS RECEIPT SCREEN */}
                {status === 'success' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px',
                    zIndex: 25,
                    borderRadius: '26px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto',
                        fontSize: '2rem',
                        color: '#10b981'
                      }}>
                        ✓
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>Pembayaran Berhasil</h3>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Jatelindo Pay Receipt</span>
                    </div>

                    <div style={{
                      borderTop: '1px dashed #d1d5db',
                      borderBottom: '1px dashed #d1d5db',
                      padding: '12px 0',
                      marginBottom: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '0.7rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Metode</span>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{transactionType}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>No. Tujuan</span>
                        <span style={{ fontWeight: 600, color: '#1f2937', fontFamily: 'var(--font-mono)' }}>{recipient}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>ID Transaksi</span>
                        <span style={{ fontWeight: 600, color: '#1f2937', fontFamily: 'var(--font-mono)' }}>
                          {lastTx ? lastTx.transaction_id : 'JAT-SUCCESS-9921'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '8px', marginTop: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Total Bayar</span>
                        <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                          Rp {parseFloat(amount).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={handleReset}
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', background: '#10b981', color: '#ffffff', borderRadius: '8px', border: 'none' }}
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                )}

                {/* DECLINED / FRAUD ALERT SCREEN */}
                {status === 'declined' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px',
                    zIndex: 25,
                    borderRadius: '26px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px auto',
                        fontSize: '2rem',
                        color: '#ef4444'
                      }}>
                        🛡️
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>Transaksi Ditolak!</h3>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Keamanan Transaksi Jatelindo</span>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.03)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.7rem',
                      color: '#374151',
                      lineHeight: '1.4',
                      marginBottom: '25px',
                      textAlign: 'center'
                    }}>
                      <strong style={{ color: '#ef4444', display: 'block', marginBottom: '4px' }}>Potensi Fraud Terdeteksi</strong>
                      Sistem keamanan mendeteksi bahwa pola transaksi ini melanggar kebijakan batasan aturan fraud transaksi elektronik Jatelindo.
                    </div>

                    <div style={{
                      fontSize: '0.65rem',
                      color: '#6b7280',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      borderTop: '1px solid #f3f4f6',
                      paddingTop: '12px'
                    }}>
                      <div>• ID Transaksi: <span style={{ color: '#1f2937', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{lastTx?.transaction_id}</span></div>
                      <div>• Nominal: <span style={{ color: '#1f2937', fontWeight: 600 }}>Rp {parseFloat(amount).toLocaleString('id-ID')}</span></div>
                      <div>• Status: <span style={{ color: '#ef4444', fontWeight: 700 }}>SUSPICIOUS / DETECTED</span></div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={handleReset}
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', background: '#ef4444', color: '#ffffff', borderRadius: '8px', border: 'none' }}
                      >
                        Kembali ke Beranda
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Home Bar */}
                <div className="phone-home-indicator"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
