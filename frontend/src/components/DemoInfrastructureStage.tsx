import React from 'react';
import type { EncryptResult } from '../types';
import { LockIcon, ServerIcon, SmartphoneIcon, ShieldCheckIcon } from './Icons';

interface DemoInfrastructureStageProps {
  currentStep: number;
  transactionData: {
    txId: string;
    customerId: string;
    amount: number;
    channel: string;
    time: string;
  };
  cryptoResult: EncryptResult | null;
  decryptedData: string | null;
  isPlaying: boolean;
  speed: number;
}

export const DemoInfrastructureStage: React.FC<DemoInfrastructureStageProps> = ({
  currentStep,
  transactionData,
  cryptoResult,
  decryptedData: _decryptedData,
  isPlaying,
  speed: _speed
}) => {
  // Process cards status based on currentStep (1 to 5)
  const getProcessStatus = (stepIndex: number) => {
    if (currentStep > stepIndex) return { status: 'done', label: '✓ Selesai', cls: 'proc-done' };
    if (currentStep === stepIndex) return { status: 'active', label: '◌ Proses...', cls: 'proc-active' };
    return { status: 'pending', label: '○ Menunggu', cls: 'proc-pending' };
  };

  const proc1 = getProcessStatus(2); // AES-256-GCM
  const proc2 = getProcessStatus(3); // RSA-OAEP
  const proc3 = getProcessStatus(4); // Paket Terenkripsi
  const proc4 = getProcessStatus(4); // Transfer Jaringan
  const proc5 = getProcessStatus(5); // Dekripsi & Verifikasi

  // Real-time Transformation Details for Current Packet
  const getPacketDetails = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Data Asli Transaksi (Plaintext JSON)',
          status: 'Teks Terang • Belum Enkripsi',
          preview: `{"customer_id": "${transactionData.customerId}", "amount": ${transactionData.amount}, "channel": "${transactionData.channel}"}`,
          badgeColor: '#10b981',
          bg: '#f0fdf4',
          borderColor: '#86efac',
          textColor: '#15803d',
          nodeFrom: 'Pengirim (Nasabah)',
          nodeTo: 'Server Pengirim (Aplikasi & API)'
        };
      case 2:
        return {
          title: 'Transformasi Enkripsi Hibrida di Server',
          status: 'Sedang Mengunci Payload & Kunci Sesi',
          preview: 'AES-256-GCM menyandikan payload ➔ RSA-2048 membungkus kunci sesi ephemeral',
          badgeColor: '#2563eb',
          bg: '#eff6ff',
          borderColor: '#93c5fd',
          textColor: '#1d4ed8',
          nodeFrom: 'Server Pengirim',
          nodeTo: 'Server Pengirim (Proses Internal)'
        };
      case 3:
        return {
          title: 'Paket Terenkripsi Ganda Melintasi Jaringan',
          status: 'Tersandi Penuh • Aman dari Sniffing / MITM',
          preview: `Ciphertext: ${cryptoResult ? cryptoResult.ciphertext.slice(0, 24) : '50qhnRN1ad3d'}... | Kunci RSA: ${cryptoResult ? cryptoResult.encrypted_session_key.slice(0, 16) : 'a3f8ec24'}...`,
          badgeColor: '#0891b2',
          bg: '#ecfeff',
          borderColor: '#67e8f9',
          textColor: '#0e7490',
          nodeFrom: 'Server Pengirim',
          nodeTo: 'Jaringan Aman (TLS / Cloud)'
        };
      case 4:
        return {
          title: 'Dekripsi & Verifikasi Tag di Server Penerima',
          status: 'Kunci Privat RSA Membuka Kunci Sesi',
          preview: 'Kunci Privat RSA membuka Kunci Sesi AES ➔ AES-GCM memverifikasi 16-Byte Authentication Tag',
          badgeColor: '#d97706',
          bg: '#fffbeb',
          borderColor: '#fde68a',
          textColor: '#b45309',
          nodeFrom: 'Jaringan Aman (TLS)',
          nodeTo: 'Server Penerima (Aplikasi & API)'
        };
      case 5:
      default:
        return {
          title: 'Data Sah Diterima & Terverifikasi 100%',
          status: 'Integritas Terbukti • Authentication Tag MATCH',
          preview: `Pembayaran QRIS Rp ${transactionData.amount.toLocaleString('id-ID')} diverifikasi dan diterima!`,
          badgeColor: '#059669',
          bg: '#f0fdf4',
          borderColor: '#86efac',
          textColor: '#047857',
          nodeFrom: 'Server Penerima',
          nodeTo: 'Penerima (Merchant / SOC)'
        };
    }
  };

  const packet = getPacketDetails();

  // Position calculation for visual traveling packet capsule (percentage 0 to 100%)
  const packetPositions = {
    1: '12%',
    2: '28%',
    3: '50%',
    4: '72%',
    5: '88%'
  };

  return (
    <div className="demo-infra-card">
      <div className="demo-infra-layout">
        {/* ============================================================ */}
        {/* ENTITY 1: PENGIRIM (NASABAH PHONE)                          */}
        {/* ============================================================ */}
        <div className="infra-phone-col">
          <div className="infra-node-label">
            <span className="infra-node-badge blue">
              <SmartphoneIcon size={13} />
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Pengirim (Nasabah)</span>
          </div>

          <div className="mini-phone-device sender">
            <div className="mini-phone-notch"></div>
            
            <div className="mini-phone-screen">
              {/* App Bar */}
              <div className="mini-app-bar">
                <span style={{ fontWeight: 800, letterSpacing: '0.04em' }}>JATELINDO PAY</span>
              </div>

              {/* Transaction Summary Card inside Phone */}
              <div className="mini-tx-card">
                <div className="mini-tx-field">
                  <span className="mini-tx-lbl">ID Transaksi</span>
                  <span className="mini-tx-val">{transactionData.txId}</span>
                </div>

                <div className="mini-tx-field">
                  <span className="mini-tx-lbl">Nominal</span>
                  <span className="mini-tx-val amount">
                    Rp {transactionData.amount.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="mini-tx-field">
                  <span className="mini-tx-lbl">Metode Pembayaran</span>
                  <span className="mini-tx-val">QRIS Dinamis</span>
                </div>

                <div className="mini-tx-field">
                  <span className="mini-tx-lbl">Channel</span>
                  <span className="mini-tx-val">{transactionData.channel}</span>
                </div>

                <div className="mini-tx-field">
                  <span className="mini-tx-lbl">Waktu</span>
                  <span className="mini-tx-val">{transactionData.time}</span>
                </div>

                <button className="mini-phone-btn" type="button">
                  Detail Transaksi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MIDDLE STAGE: 5-STEP INFRASTRUCTURE NETWORK PIPELINE        */}
        {/* ============================================================ */}
        <div className="infra-center-col">
          {/* Subheading */}
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Proses Kriptografi & Infrastruktur Jatelindo</span>
            <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
              Tahap Aktif: Langkah {currentStep} dari 5
            </span>
          </div>

          {/* Process Mini Status Cards Grid */}
          <div className="infra-proc-cards-row">
            <div className={`infra-proc-card ${proc1.cls}`}>
              <div className="proc-card-icon aes">
                {currentStep > 2 ? '✓' : '●'}
              </div>
              <div className="proc-card-text">
                <span className="proc-name">AES-256-GCM</span>
                <span className="proc-sub">Enkripsi payload</span>
              </div>
              <span className={`proc-pill ${proc1.status}`}>{proc1.label}</span>
            </div>

            <div className={`infra-proc-card ${proc2.cls}`}>
              <div className="proc-card-icon rsa">
                {currentStep > 3 ? '✓' : currentStep === 3 ? '◌' : '●'}
              </div>
              <div className="proc-card-text">
                <span className="proc-name">RSA-OAEP</span>
                <span className="proc-sub">Enkripsi kunci sesi</span>
              </div>
              <span className={`proc-pill ${proc2.status}`}>{proc2.label}</span>
            </div>

            <div className={`infra-proc-card ${proc3.cls}`}>
              <div className="proc-card-icon packet">
                <LockIcon size={12} />
              </div>
              <div className="proc-card-text">
                <span className="proc-name">Paket Terenkripsi</span>
                <span className="proc-sub">Siapkan paket data</span>
              </div>
              <span className={`proc-pill ${proc3.status}`}>{proc3.label}</span>
            </div>

            <div className={`infra-proc-card ${proc4.cls}`}>
              <div className="proc-card-icon network">
                <ServerIcon size={12} />
              </div>
              <div className="proc-card-text">
                <span className="proc-name">Transfer Jaringan</span>
                <span className="proc-sub">Kirim ke penerima</span>
              </div>
              <span className={`proc-pill ${proc4.status}`}>{proc4.label}</span>
            </div>

            <div className={`infra-proc-card ${proc5.cls}`}>
              <div className="proc-card-icon verify">
                <ShieldCheckIcon size={12} />
              </div>
              <div className="proc-card-text">
                <span className="proc-name">Dekripsi & Verifikasi</span>
                <span className="proc-sub">Buka kunci & cek tag</span>
              </div>
              <span className={`proc-pill ${proc5.status}`}>{proc5.label}</span>
            </div>
          </div>

          {/* REAL-TIME DATA PACKET TRANSFORMATION BANNER (MENAMPILKAN BENTUK DATA YANG SEDANG DIKIRIM) */}
          <div 
            className="infra-packet-status-card"
            style={{ 
              backgroundColor: packet.bg, 
              border: `1.5px solid ${packet.borderColor}`,
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '10px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.4s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>
                  {currentStep === 1 ? '📦' : currentStep === 2 ? '🔒' : currentStep === 3 ? '🛡️' : currentStep === 4 ? '🔑' : '✅'}
                </span>
                <strong style={{ fontSize: '0.82rem', color: packet.textColor }}>
                  {packet.title}
                </strong>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: '10px', color: packet.textColor, border: `1px solid ${packet.borderColor}` }}>
                {packet.status}
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', backgroundColor: 'rgba(255, 255, 255, 0.75)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)', wordBreak: 'break-all', lineHeight: 1.35 }}>
              {packet.preview}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>Dari: <strong>{packet.nodeFrom}</strong></span>
              <span>Menuju: <strong>{packet.nodeTo}</strong></span>
            </div>
          </div>

          {/* Horizontal Infrastructure Nodes & Animated Connection Cable */}
          <div className="infra-nodes-stage">
            {/* SVG Connecting Flow Lines with Packets */}
            <svg className="infra-flow-svg" viewBox="0 0 680 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>

              {/* Cable 1: Sender -> Sender Server */}
              <line x1="40" y1="50" x2="160" y2="50" stroke={currentStep >= 2 ? "#2563eb" : "#cbd5e1"} strokeWidth="3" strokeDasharray={currentStep === 1 && isPlaying ? "6 3" : "none"} />
              
              {/* Cable 2: Sender Server -> Cloud */}
              <line x1="200" y1="50" x2="310" y2="50" stroke={currentStep >= 3 ? "#06b6d4" : "#cbd5e1"} strokeWidth="3" strokeDasharray={currentStep === 2 && isPlaying ? "6 3" : "none"} />
              
              {/* Cable 3: Cloud -> Receiver Server */}
              <line x1="370" y1="50" x2="480" y2="50" stroke={currentStep >= 4 ? "#06b6d4" : "#cbd5e1"} strokeWidth="3" strokeDasharray={currentStep === 3 && isPlaying ? "6 3" : "none"} />
              
              {/* Cable 4: Receiver Server -> Recipient */}
              <line x1="520" y1="50" x2="640" y2="50" stroke={currentStep >= 5 ? "#10b981" : "#cbd5e1"} strokeWidth="3" strokeDasharray={currentStep === 4 && isPlaying ? "6 3" : "none"} />
            </svg>

            {/* Traveling Data Packet Capsule Badge (VISUALISASI PERPINDAHAN DATA YANG JELAS TERLIHAT) */}
            <div 
              className="traveling-data-capsule"
              style={{
                left: packetPositions[currentStep as keyof typeof packetPositions] || '50%',
                transition: 'left 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div className="capsule-pulse-halo" style={{ borderColor: packet.badgeColor }}></div>
              <div className="capsule-inner-pill" style={{ backgroundColor: packet.textColor }}>
                {currentStep === 1 && <span className="capsule-text">JSON</span>}
                {currentStep === 2 && <span className="capsule-text">AES+RSA</span>}
                {currentStep === 3 && <span className="capsule-text">CIPHER</span>}
                {currentStep === 4 && <span className="capsule-text">DECRYPT</span>}
                {currentStep === 5 && <span className="capsule-text">VALID</span>}
              </div>
            </div>

            {/* Node 1: Pengirim (Nasabah) */}
            <div className={`infra-node ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="infra-node-circle">
                <SmartphoneIcon size={20} />
              </div>
              <span className="infra-node-title">Pengirim</span>
              <span className="infra-node-role">(Nasabah)</span>
            </div>

            <span className="infra-node-arrow">›</span>

            {/* Node 2: Server Pengirim (Aplikasi & API) */}
            <div className={`infra-node ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="infra-node-circle server">
                <ServerIcon size={20} />
              </div>
              <span className="infra-node-title">Server Pengirim</span>
              <span className="infra-node-role">Aplikasi & API</span>
            </div>

            <span className="infra-node-arrow">›</span>

            {/* Node 3: Jaringan Aman (TLS / Cloud) */}
            <div className={`infra-node cloud ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="infra-node-circle cloud">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>
              <span className="infra-node-title">Jaringan Aman</span>
              <span className="infra-node-role">TLS / Encrypted Channel</span>
            </div>

            <span className="infra-node-arrow">›</span>

            {/* Node 4: Server Penerima (Aplikasi & API) */}
            <div className={`infra-node ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="infra-node-circle server">
                <ServerIcon size={20} />
              </div>
              <span className="infra-node-title">Server Penerima</span>
              <span className="infra-node-role">Aplikasi & API</span>
            </div>

            <span className="infra-node-arrow">›</span>

            {/* Node 5: Penerima (Merchant / SOC) */}
            <div className={`infra-node ${currentStep >= 5 ? 'active' : ''}`}>
              <div className="infra-node-circle recipient">
                <SmartphoneIcon size={20} />
              </div>
              <span className="infra-node-title">Penerima</span>
              <span className="infra-node-role">(Merchant / SOC)</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ENTITY 5: PENERIMA (MERCHANT / SOC PHONE)                    */}
        {/* ============================================================ */}
        <div className="infra-phone-col">
          <div className="infra-node-label">
            <span className="infra-node-badge cyan">
              <SmartphoneIcon size={13} />
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Penerima (Merchant)</span>
          </div>

          <div className="mini-phone-device receiver">
            <div className="mini-phone-notch"></div>
            
            <div className="mini-phone-screen">
              {/* Receiver Status View */}
              {currentStep < 5 ? (
                <div className="mini-receiver-waiting">
                  <div className="mini-receiver-spinner"></div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e293b' }}>
                    Menunggu Data...
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', lineHeight: 1.3 }}>
                    Paket terenkripsi sedang diterima
                  </div>

                  {/* Checklist Indicators */}
                  <div className="mini-receiver-checklist">
                    <div className={`check-item ${currentStep >= 3 ? 'checked' : ''}`}>
                      <span>{currentStep >= 3 ? '✓' : '○'}</span>
                      <span>Menerima paket sandi</span>
                    </div>
                    <div className={`check-item ${currentStep >= 4 ? 'checked' : ''}`}>
                      <span>{currentStep >= 4 ? '✓' : '○'}</span>
                      <span>Membuka kunci RSA-2048</span>
                    </div>
                    <div className={`check-item ${currentStep >= 4 ? 'checked' : ''}`}>
                      <span>{currentStep >= 4 ? '✓' : '○'}</span>
                      <span>Mendekripsi payload AES-256</span>
                    </div>
                    <div className={`check-item ${currentStep >= 5 ? 'checked' : ''}`}>
                      <span>{currentStep >= 5 ? '✓' : '○'}</span>
                      <span>Verifikasi autentikasi tag</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 5: Verified & Decrypted Success State */
                <div className="mini-receiver-success">
                  <div className="success-icon-badge">✓</div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#059669', marginTop: '4px' }}>
                    PEMBAYARAN DITERIMA!
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    Data & Kunci Terverifikasi 100%
                  </div>

                  <div className="mini-tx-card verified" style={{ marginTop: '8px' }}>
                    <div className="mini-tx-field">
                      <span className="mini-tx-lbl">Nominal Valid</span>
                      <span className="mini-tx-val amount" style={{ color: '#059669' }}>
                        Rp {transactionData.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="mini-tx-field">
                      <span className="mini-tx-lbl">Pengirim</span>
                      <span className="mini-tx-val">{transactionData.customerId}</span>
                    </div>
                    <div className="mini-tx-field">
                      <span className="mini-tx-lbl">Integritas Tag</span>
                      <span className="mini-tx-val" style={{ color: '#059669', fontWeight: 700 }}>
                        MATCH (16 Bytes)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
