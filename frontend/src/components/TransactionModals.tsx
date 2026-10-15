import React, { useState } from 'react';
import type { Transaction } from '../types';
import { 
  CloseIcon, 
  CopyIcon, 
  CheckIcon, 
  ShieldCheckIcon, 
  ShieldAlertIcon, 
  LockIcon, 
  UnlockIcon, 
  KeyIcon 
} from './Icons';
import { REGISTERED_USERS } from './user/UserDirectoryData';
import './TransactionModal.css';

export const CUSTOMER_DIRECTORY: Record<string, { name: string; mask: string }> = {
  ...Object.fromEntries(
    REGISTERED_USERS.map((u) => [
      u.id,
      { name: u.name, mask: `•••• ${u.account.slice(-4)}` }
    ])
  ),
  ...Object.fromEntries(
    REGISTERED_USERS.map((u) => [
      u.name,
      { name: u.name, mask: `•••• ${u.account.slice(-4)}` }
    ])
  ),
  'CUST-102': { name: 'Eko Prasetyo', mask: '•••• 3301' },
  'CUST-PLN-889': { name: 'Ahmad Dani', mask: '•••• 9988' },
  'JAT-QRIS-9928': { name: 'Luciana Chen (QRIS)', mask: '•••• 2300' }
};

interface TransactionDetailModalProps {
  tx: Transaction;
  onClose: () => void;
  onOpenDecrypt?: (tx: Transaction) => void;
  onDecrypt?: (id: number) => Promise<string | { plaintext: string }>;
  role?: string;
  customerName?: string;
  onNavigate?: (tab: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  tx,
  onClose,
  onOpenDecrypt,
  onDecrypt,
  role,
  customerName,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'crypto'>('details');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inline decryption state
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const isSuccess = tx.status === 'SUCCESS';
  const canDecrypt = role === 'FraudAnalyst' || role === 'SecurityAdmin';

  // Sender info resolution
  const senderInfo = CUSTOMER_DIRECTORY[tx.customer_id];
  const senderName = customerName 
    ? customerName 
    : senderInfo 
      ? senderInfo.name 
      : tx.customer_id;
  const senderAccount = senderInfo ? senderInfo.mask : `ID: ${tx.customer_id}`;
  const senderInitials = senderName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'PG';

  // Recipient info resolution
  const recipientName = tx.recipient_name || (
    tx.channel?.toUpperCase().includes('QRIS') 
      ? 'Merchant QRIS Terdaftar' 
      : tx.channel?.toUpperCase().includes('VA') || tx.channel?.toUpperCase().includes('VIRTUAL')
        ? 'Biller Virtual Account'
        : 'Nasabah Penerima'
  );
  const recipientAccount = tx.recipient_account || (
    CUSTOMER_DIRECTORY[recipientName]?.mask || '•••• Rekening Tujuan'
  );
  const recipientInitials = recipientName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'PN';

  const handleCopy = (key: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleInlineDecrypt = async () => {
    if (onDecrypt) {
      setIsDecrypting(true);
      setDecryptError(null);
      try {
        const res = await onDecrypt(tx.id);
        const text = typeof res === 'string' ? res : res.plaintext;
        setDecryptedText(text);
      } catch (err) {
        setDecryptError(err instanceof Error ? err.message : 'Gagal mendekripsi payload.');
      } finally {
        setIsDecrypting(false);
      }
    } else if (onOpenDecrypt) {
      onOpenDecrypt(tx);
    }
  };

  const handleCopySummary = () => {
    const summaryText = `[RINCIAN TRANSAKSI JATELINDO]
ID Transaksi: #${tx.transaction_id}
Waktu: ${new Date(tx.timestamp).toLocaleString('id-ID')} WIB
Pengirim: ${senderName} (${senderAccount})
Penerima: ${recipientName} (${recipientAccount})
Nominal: Rp ${tx.amount.toLocaleString('id-ID')}
Kanal: ${tx.channel}
Status Keamanan: ${tx.status}`;
    handleCopy('summary', summaryText);
  };

  return (
    <div className="tx-modal-overlay" onClick={onClose}>
      <div className="tx-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tx-modal-header">
          <div className="tx-modal-header-left">
            <div className={`tx-modal-icon-badge ${isSuccess ? 'success' : 'suspicious'}`}>
              {isSuccess ? <ShieldCheckIcon size={22} /> : <ShieldAlertIcon size={22} />}
            </div>
            <div className="tx-modal-title-group">
              <h3>Rincian Lengkap Transaksi</h3>
              <div className="tx-modal-id-row">
                <span className="tx-modal-id-text">#{tx.transaction_id}</span>
                <button 
                  className="tx-copy-btn"
                  onClick={() => handleCopy('txid', tx.transaction_id)}
                  title="Salin ID Transaksi"
                >
                  {copiedKey === 'txid' ? (
                    <><CheckIcon size={11} /> Tersalin</>
                  ) : (
                    <><CopyIcon size={11} /> Salin ID</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="tx-modal-header-right">
            <span className={`tx-status-pill ${isSuccess ? 'success' : 'suspicious'}`}>
              ● {tx.status}
            </span>
            <button className="tx-close-btn" onClick={onClose} title="Tutup Modal">
              <CloseIcon size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="tx-modal-body">
          {/* Amount Hero */}
          <div className="tx-amount-card">
            <span className="tx-amount-label">Nominal Transaksi</span>
            <div className="tx-amount-value">
              Rp {tx.amount.toLocaleString('id-ID')}
            </div>
            <div className="tx-amount-meta">
              <span>Biaya Layanan: <strong>Rp 0</strong></span>
              <span className="tx-amount-dot"></span>
              <span>Kanal: <strong>{tx.channel}</strong></span>
              <span className="tx-amount-dot"></span>
              <span>{new Date(tx.timestamp).toLocaleString('id-ID')} WIB</span>
            </div>
          </div>

          {/* Dual Party (Pengirim -> Penerima) */}
          <div className="tx-parties-wrapper">
            {/* Pengirim */}
            <div className="tx-party-card">
              <div className="tx-party-avatar">
                {senderInitials}
              </div>
              <div className="tx-party-info">
                <span className="tx-party-role">Nasabah Pengirim</span>
                <span className="tx-party-name" title={senderName}>{senderName}</span>
                <span className="tx-party-account">{senderAccount}</span>
              </div>
            </div>

            {/* Transfer Direction Indicator */}
            <div className="tx-transfer-bridge">
              <span className="tx-bridge-pill">{tx.channel}</span>
              <div className="tx-bridge-line">
                <span style={{ height: '2px', width: '22px', backgroundColor: 'var(--primary-blue)', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>➔</span>
              </div>
            </div>

            {/* Penerima / User Tujuan */}
            <div className="tx-party-card recipient">
              <div className="tx-party-avatar recipient-avatar">
                {recipientInitials}
              </div>
              <div className="tx-party-info">
                <span className="tx-party-role target">User Tujuan (Penerima)</span>
                <span className="tx-party-name" title={recipientName}>{recipientName}</span>
                <span className="tx-party-account">{recipientAccount}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tx-tabs-nav">
            <button 
              className={`tx-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <span>Ringkasan Transaksi</span>
            </button>
            <button 
              className={`tx-tab-btn ${activeTab === 'crypto' ? 'active' : ''}`}
              onClick={() => setActiveTab('crypto')}
            >
              <KeyIcon size={13} />
              <span>Forensik Kriptografi</span>
            </button>
          </div>

          {/* Tab 1: Ringkasan Transaksi */}
          {activeTab === 'details' && (
            <div className="tx-kv-container">
              <div className="tx-kv-item">
                <span className="tx-kv-label">ID Transaksi</span>
                <div className="tx-kv-value mono" style={{ color: 'var(--primary-blue)' }}>
                  #{tx.transaction_id}
                </div>
              </div>

              <div className="tx-kv-item">
                <span className="tx-kv-label">Waktu Transaksi (WIB)</span>
                <div className="tx-kv-value">
                  {new Date(tx.timestamp).toLocaleString('id-ID')}
                </div>
              </div>

              <div className="tx-kv-item">
                <span className="tx-kv-label">Nasabah Pengirim</span>
                <div className="tx-kv-value">
                  {senderName}
                </div>
              </div>

              <div className="tx-kv-item">
                <span className="tx-kv-label">Penerima / User Tujuan</span>
                <div className="tx-kv-value" style={{ color: '#16a34a' }}>
                  {recipientName}
                </div>
              </div>

              <div className="tx-kv-item">
                <span className="tx-kv-label">Rekening / ID Tujuan</span>
                <div className="tx-kv-value mono">
                  {recipientAccount}
                </div>
              </div>

              <div className="tx-kv-item">
                <span className="tx-kv-label">Kanal Pembayaran</span>
                <div className="tx-kv-value">
                  {tx.channel}
                </div>
              </div>

              <div className="tx-kv-item">
                <span className="tx-kv-label">Status Keamanan</span>
                <div className="tx-kv-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`tx-status-pill ${isSuccess ? 'success' : 'suspicious'}`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                    ● {tx.status}
                  </span>
                </div>
              </div>

              <div className="tx-kv-item">
                <span className="tx-kv-label">Protokol Keamanan</span>
                <div className="tx-kv-value" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  AES-256-GCM + RSA-2048 Hybrid
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Forensik Kriptografi */}
          {activeTab === 'crypto' && (
            <div className="tx-forensics-block">
              {/* Ciphertext Card */}
              <div className="tx-crypto-box">
                <div className="tx-crypto-header">
                  <div className="tx-crypto-title">
                    <LockIcon size={14} />
                    <span>Payload Ciphertext (AES-256-GCM)</span>
                    <span className="tx-crypto-badge">{tx.encrypted_payload?.length || 0} Karakter</span>
                  </div>
                  <button 
                    className="tx-copy-btn"
                    onClick={() => handleCopy('cipher', tx.encrypted_payload || '')}
                  >
                    {copiedKey === 'cipher' ? <><CheckIcon size={11} /> Disalin</> : <><CopyIcon size={11} /> Salin</>}
                  </button>
                </div>
                <div className="tx-crypto-content">
                  {tx.encrypted_payload || '// Ciphertext tidak tersedia'}
                </div>
              </div>

              {/* RSA Session Key Card */}
              <div className="tx-crypto-box">
                <div className="tx-crypto-header">
                  <div className="tx-crypto-title">
                    <KeyIcon size={14} />
                    <span>Encrypted Session Key (RSA-2048 OAEP)</span>
                    <span className="tx-crypto-badge" style={{ color: '#d97706', background: 'rgba(217, 119, 6, 0.1)' }}>
                      Kunci Sesi Terproteksi
                    </span>
                  </div>
                  <button 
                    className="tx-copy-btn"
                    onClick={() => handleCopy('rsa', tx.encrypted_session_key || '')}
                  >
                    {copiedKey === 'rsa' ? <><CheckIcon size={11} /> Disalin</> : <><CopyIcon size={11} /> Salin</>}
                  </button>
                </div>
                <div className="tx-crypto-content" style={{ color: '#d97706' }}>
                  {tx.encrypted_session_key || '// RSA Key tidak tersedia'}
                </div>
              </div>

              {/* Decrypted Payload Result or Action */}
              {decryptedText ? (
                <div className="tx-decrypted-card">
                  <div className="tx-decrypted-header">
                    <div className="tx-decrypted-status">
                      <UnlockIcon size={15} />
                      <span>Payload Berhasil Didekripsi (Plaintext Terverifikasi)</span>
                    </div>
                    <button 
                      className="tx-copy-btn"
                      onClick={() => handleCopy('plain', decryptedText)}
                    >
                      {copiedKey === 'plain' ? <><CheckIcon size={11} /> Disalin</> : <><CopyIcon size={11} /> Salin JSON</>}
                    </button>
                  </div>

                  {(() => {
                    try {
                      const parsed = JSON.parse(decryptedText);
                      return (
                        <>
                          <div className="tx-decrypted-grid">
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nasabah Pengirim:</span>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{parsed.customer_id || '-'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#16a34a' }}>User Tujuan (Penerima):</span>
                              <div style={{ fontWeight: 700, color: '#15803d' }}>
                                {parsed.recipient_name || '-'}
                                {parsed.recipient_account && <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.72rem' }}> ({parsed.recipient_account})</span>}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal:</span>
                              <div style={{ fontWeight: 700, color: '#2563eb' }}>
                                Rp {typeof parsed.amount === 'number' ? parsed.amount.toLocaleString('id-ID') : parsed.amount}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kanal Transaksi:</span>
                              <div style={{ fontWeight: 600 }}>{parsed.channel || '-'}</div>
                            </div>
                          </div>
                          <div className="tx-decrypted-json-viewer">
                            {JSON.stringify(parsed, null, 2)}
                          </div>
                        </>
                      );
                    } catch {
                      return (
                        <div className="tx-decrypted-json-viewer">
                          {decryptedText}
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                canDecrypt && (
                  <div className="tx-decrypt-panel">
                    <div className="tx-decrypt-info">
                      <div className="tx-decrypt-icon">
                        <KeyIcon size={16} />
                      </div>
                      <div className="tx-decrypt-text">
                        <h4>Akses Investigasi Dekripsi Payload</h4>
                        <p>
                          Sebagai <strong>{role}</strong>, Anda berwenang membuka payload terenkripsi menggunakan kunci privat RSA.
                        </p>
                        {decryptError && (
                          <p style={{ color: '#ef4444', marginTop: '4px', fontWeight: 600 }}>
                            Error: {decryptError}
                          </p>
                        )}
                      </div>
                    </div>
                    <button 
                      className="tx-btn tx-btn-primary"
                      onClick={handleInlineDecrypt}
                      disabled={isDecrypting}
                    >
                      {isDecrypting ? (
                        'Mendekripsi...'
                      ) : (
                        <>
                          <UnlockIcon size={14} />
                          <span>Dekripsi Payload</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tx-modal-footer">
          <button 
            className="tx-btn tx-btn-secondary"
            onClick={handleCopySummary}
          >
            {copiedKey === 'summary' ? (
              <><CheckIcon size={13} /> Rincian Disalin</>
            ) : (
              <><CopyIcon size={13} /> Salin Rincian</>
            )}
          </button>

          <div className="tx-footer-actions">
            <button className="tx-btn tx-btn-secondary" onClick={onClose}>
              Tutup
            </button>
            {onNavigate && (
              <button 
                className="tx-btn tx-btn-primary"
                onClick={() => {
                  onClose();
                  onNavigate('transactions');
                }}
              >
                Lihat di Menu Transaksi →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TransactionDecryptModalProps {
  tx: Transaction;
  onClose: () => void;
  decryptedText: string | null;
  loadingDecrypt: boolean;
  decryptError: string | null;
}

export const TransactionDecryptModal: React.FC<TransactionDecryptModalProps> = ({
  tx,
  onClose,
  decryptedText,
  loadingDecrypt,
  decryptError
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="tx-modal-overlay" onClick={onClose}>
      <div className="tx-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="tx-modal-header">
          <div className="tx-modal-header-left">
            <div className="tx-modal-icon-badge">
              <UnlockIcon size={20} />
            </div>
            <div className="tx-modal-title-group">
              <h3>Hasil Dekripsi Payload Forensik</h3>
              <div className="tx-modal-id-row">
                <span className="tx-modal-id-text">#{tx.transaction_id}</span>
              </div>
            </div>
          </div>
          <button className="tx-close-btn" onClick={onClose}>
            <CloseIcon size={14} />
          </button>
        </div>

        <div className="tx-modal-body">
          <div className="tx-forensics-block">
            {/* Decrypted Card */}
            <div>
              <span className="tx-amount-label" style={{ display: 'block', marginBottom: '6px' }}>
                Hasil Dekripsi Kunci Privat RSA & Plaintext AES-GCM
              </span>
              {loadingDecrypt ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--primary-blue)', fontSize: '0.86rem' }}>
                  Sedang memproses dekripsi hybrid payload...
                </div>
              ) : decryptError ? (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#ef4444', fontSize: '0.82rem' }}>
                  Error: {decryptError}
                </div>
              ) : (
                <div className="tx-decrypted-card">
                  <div className="tx-decrypted-header">
                    <div className="tx-decrypted-status">
                      <CheckIcon size={14} />
                      <span>Integritas Terverifikasi (Kunci Sesi & Tag GCM Valid)</span>
                    </div>
                    <button 
                      className="tx-copy-btn"
                      onClick={() => handleCopy('all', decryptedText || '')}
                    >
                      {copiedKey === 'all' ? <><CheckIcon size={11} /> Disalin</> : <><CopyIcon size={11} /> Salin</>}
                    </button>
                  </div>

                  {(() => {
                    try {
                      const parsed = JSON.parse(decryptedText || '{}');
                      return (
                        <>
                          <div className="tx-decrypted-grid">
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nasabah Pengirim:</span>
                              <div style={{ fontWeight: 700 }}>{parsed.customer_id || '-'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#16a34a' }}>User Tujuan (Penerima):</span>
                              <div style={{ fontWeight: 700, color: '#15803d' }}>
                                {parsed.recipient_name || '-'}
                                {parsed.recipient_account && <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}> ({parsed.recipient_account})</span>}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal Transaksi:</span>
                              <div style={{ fontWeight: 700, color: '#2563eb' }}>
                                Rp {typeof parsed.amount === 'number' ? parsed.amount.toLocaleString('id-ID') : parsed.amount}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kanal Transaksi:</span>
                              <div style={{ fontWeight: 600 }}>{parsed.channel || '-'}</div>
                            </div>
                          </div>
                          <div className="tx-decrypted-json-viewer">
                            {JSON.stringify(parsed, null, 2)}
                          </div>
                        </>
                      );
                    } catch {
                      return (
                        <div className="tx-decrypted-json-viewer">
                          {decryptedText}
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <strong>Kepatuhan Audit:</strong> Pembukaan data enkripsi ini dicatat ke dalam <strong>Audit Logs</strong> secara otomatis untuk menjamin akuntabilitas pengawasan forensik perbankan.
            </div>
          </div>
        </div>

        <div className="tx-modal-footer">
          <div></div>
          <button className="tx-btn tx-btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
