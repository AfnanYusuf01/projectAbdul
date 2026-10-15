import React, { useState, useEffect } from 'react';
import type { EncryptResult } from '../types';
import { CopyIcon, CheckIcon, FileSpreadsheetIcon } from './Icons';

interface DemoCryptoInspectorProps {
  currentStep: number;
  plaintext: string;
  cryptoResult: EncryptResult | null;
  decryptedData: string | null;
  transactionData: {
    txId: string;
    customerId: string;
    amount: number;
    channel: string;
    time: string;
  };
}

export const DemoCryptoInspector: React.FC<DemoCryptoInspectorProps> = ({
  currentStep,
  plaintext,
  cryptoResult,
  decryptedData,
  transactionData: _transactionData
}) => {
  const [activeTab, setActiveTab] = useState<'plaintext' | 'cipher' | 'rsa_key' | 'auth_tag' | 'verified'>('plaintext');
  const [copied, setCopied] = useState(false);

  // Synchronize active inspector tab with currentStep as data moves through pipeline
  useEffect(() => {
    if (currentStep === 1) setActiveTab('plaintext');
    else if (currentStep === 2) setActiveTab('cipher');
    else if (currentStep === 3) setActiveTab('rsa_key');
    else if (currentStep === 4) setActiveTab('auth_tag');
    else if (currentStep === 5) setActiveTab('verified');
  }, [currentStep]);

  // Content for each tab
  const getTabContent = () => {
    switch (activeTab) {
      case 'plaintext':
        return plaintext;
      case 'cipher':
        return cryptoResult?.ciphertext || '// Menunggu tahap enkripsi AES-256-GCM (Langkah 2)...';
      case 'rsa_key':
        return cryptoResult?.encrypted_session_key || '// Menunggu tahap pembungkusan kunci sesi dengan RSA-2048 (Langkah 3)...';
      case 'auth_tag':
        return `IV (96-bit Nonce):\n${cryptoResult?.iv || '// Pending'}\n\nAuthentication Tag (128-bit GCM Tag):\n${cryptoResult?.tag || '// Pending'}`;
      case 'verified':
        return decryptedData || (currentStep === 5 ? plaintext : '// Menunggu tahap dekripsi dan verifikasi penerima (Langkah 5)...');
      default:
        return '';
    }
  };

  const handleCopy = () => {
    const text = getTabContent();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const payloadSizeBytes = new TextEncoder().encode(plaintext).length;

  return (
    <div className="demo-bottom-split">
      {/* ============================================================ */}
      {/* LEFT: CRYPTOGRAPHY INSPECTOR CARD (DARK NAVY)               */}
      {/* ============================================================ */}
      <div className="crypto-dark-panel inspector-card">
        {/* Card Header & Tabs */}
        <div className="dark-card-header">
          <div className="dark-card-title">
            <span className="terminal-prompt-icon">▦</span>
            <span>Inspector Kriptografi</span>
          </div>

          {/* Inspector Tabs */}
          <div className="dark-tabs-list">
            <button
              className={`dark-tab-btn ${activeTab === 'plaintext' ? 'active' : ''}`}
              onClick={() => setActiveTab('plaintext')}
            >
              1. Plaintext JSON
            </button>
            <button
              className={`dark-tab-btn ${activeTab === 'cipher' ? 'active' : ''}`}
              onClick={() => setActiveTab('cipher')}
            >
              2. Ciphertext AES
            </button>
            <button
              className={`dark-tab-btn ${activeTab === 'rsa_key' ? 'active' : ''}`}
              onClick={() => setActiveTab('rsa_key')}
            >
              3. Kunci AES (RSA)
            </button>
            <button
              className={`dark-tab-btn ${activeTab === 'auth_tag' ? 'active' : ''}`}
              onClick={() => setActiveTab('auth_tag')}
            >
              4. IV & Authentication Tag
            </button>
            <button
              className={`dark-tab-btn ${activeTab === 'verified' ? 'active' : ''}`}
              onClick={() => setActiveTab('verified')}
            >
              5. Hasil Verifikasi
            </button>
          </div>
        </div>

        {/* Panel Content (Split: Code & Payload Info) */}
        <div className="dark-split-body">
          {/* Left: Code Viewer */}
          <div className="code-viewer-area">
            <div className="code-viewer-top">
              <span className="code-lang-label">
                {activeTab === 'plaintext' || activeTab === 'verified' ? 'JSON' : 'RAW BASE64'}
              </span>
              <button className="copy-code-btn" onClick={handleCopy}>
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <pre className="dark-code-pre">
              <code>{getTabContent()}</code>
            </pre>
          </div>

          {/* Right: Payload Metadata Sidebar */}
          <div className="payload-meta-sidebar">
            <div className="meta-sidebar-title">
              <span>Informasi Payload</span>
            </div>

            <div className="meta-field-row">
              <span className="meta-lbl">Format</span>
              <span className="meta-val">: JSON</span>
            </div>

            <div className="meta-field-row">
              <span className="meta-lbl">Ukuran Data</span>
              <span className="meta-val">: {payloadSizeBytes} bytes</span>
            </div>

            <div className="meta-field-row">
              <span className="meta-lbl">Encoding</span>
              <span className="meta-val">: UTF-8</span>
            </div>

            <div className="meta-field-row">
              <span className="meta-lbl">Hash (SHA-256)</span>
              <span className="meta-val hash">: a3f8ec24...7f9d</span>
            </div>

            <div className="meta-field-row" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="meta-lbl">Protokol</span>
              <span className="meta-val" style={{ color: '#38bdf8' }}>: AES-GCM + RSA</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT: LIVE ACTIVITY LOG CARD (DARK NAVY)                   */}
      {/* ============================================================ */}
      <div className="crypto-dark-panel log-card">
        <div className="dark-card-header">
          <div className="dark-card-title">
            <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }}>
              <FileSpreadsheetIcon size={15} />
            </span>
            <span>Log Aktivitas</span>
          </div>

          <div className="live-status-pill">
            <span className="live-pulse-dot"></span>
            <span>Live</span>
          </div>
        </div>

        {/* Timeline Log Entries */}
        <div className="dark-log-timeline">
          {/* Event 1 */}
          <div className="log-timeline-item">
            <span className="log-time">23:20:16</span>
            <div className={`log-indicator ${currentStep >= 1 ? 'done' : 'pending'}`}>
              {currentStep >= 1 ? '✓' : '○'}
            </div>
            <span className="log-desc">Transaksi dibuat oleh nasabah</span>
          </div>

          {/* Event 2 */}
          <div className="log-timeline-item">
            <span className="log-time">23:20:17</span>
            <div className={`log-indicator ${currentStep >= 2 ? 'done' : currentStep === 2 ? 'active' : 'pending'}`}>
              {currentStep >= 2 ? '✓' : currentStep === 2 ? '◌' : '○'}
            </div>
            <span className="log-desc">Enkripsi payload dengan AES-256-GCM</span>
          </div>

          {/* Event 3 */}
          <div className="log-timeline-item">
            <span className="log-time">23:20:18</span>
            <div className={`log-indicator ${currentStep >= 3 ? 'done' : currentStep === 3 ? 'active' : 'pending'}`}>
              {currentStep >= 3 ? '✓' : currentStep === 3 ? '●' : '○'}
            </div>
            <span className="log-desc">Kunci sesi dienkripsi dengan RSA-2048</span>
          </div>

          {/* Event 4 */}
          <div className="log-timeline-item">
            <span className="log-time">23:20:19</span>
            <div className={`log-indicator ${currentStep >= 4 ? 'done' : 'pending'}`}>
              {currentStep >= 4 ? '✓' : '○'}
            </div>
            <span className="log-desc">Paket data siap dikirim</span>
          </div>

          {/* Event 5 */}
          <div className="log-timeline-item">
            <span className="log-time">23:20:21</span>
            <div className={`log-indicator ${currentStep >= 4 ? 'done' : 'pending'}`}>
              {currentStep >= 4 ? '✓' : '○'}
            </div>
            <span className="log-desc">Transfer melalui jaringan aman TLS</span>
          </div>

          {/* Event 6 */}
          <div className="log-timeline-item">
            <span className="log-time">23:20:23</span>
            <div className={`log-indicator ${currentStep >= 5 ? 'done' : 'pending'}`}>
              {currentStep >= 5 ? '✓' : '○'}
            </div>
            <span className="log-desc">Paket diterima oleh merchant</span>
          </div>

          {/* Event 7 */}
          <div className="log-timeline-item">
            <span className="log-time">23:20:25</span>
            <div className={`log-indicator ${currentStep >= 5 ? 'done' : 'pending'}`}>
              {currentStep >= 5 ? '✓' : '○'}
            </div>
            <span className="log-desc">Dekripsi dan verifikasi berhasil</span>
          </div>
        </div>
      </div>
    </div>
  );
};
