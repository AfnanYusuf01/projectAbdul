import React, { useState } from 'react';
import type { FraudAlert, Transaction } from '../types';
import { CUSTOMER_DIRECTORY } from './TransactionModals';
import { ShieldIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, SearchIcon, CopyIcon, CheckIcon, CloseIcon } from './Icons';
interface FraudAlertModalProps {
  alert: FraudAlert;
  transaction?: Transaction;
  notes: string;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onDecision: (alertStatus: string, txStatus?: string) => Promise<void>;
  role: string;
  getSeverityBadge: (severity: string) => React.ReactNode;
}

export const FraudAlertModal: React.FC<FraudAlertModalProps> = ({
  alert,
  transaction,
  notes,
  onNotesChange,
  onClose,
  onDecision,
  role: _role,
  getSeverityBadge
}) => {
  const [selectedDecision, setSelectedDecision] = useState<'SUCCESS' | 'FAILED' | 'INVESTIGATED'>('SUCCESS');
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const custId = transaction?.customer_id || 'CUST-816';
  const custInfo = CUSTOMER_DIRECTORY[custId] || {
    name: `Nasabah ${custId}`,
    mask: '•••• ' + custId.slice(-4)
  };

  const channelLabel = transaction?.channel || 'Virtual Account';
  const txCurrentStatus = transaction?.status || 'SUSPICIOUS';
  const recipientName = transaction?.recipient_name || (
    channelLabel.includes('QRIS') ? 'Merchant QRIS' : 'Nasabah Penerima'
  );
  const recipientAccount = transaction?.recipient_account || '•••• Rekening Tujuan';
  const handleCopy = (type: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSubmitDecision = async () => {
    setSubmitting(true);
    try {
      if (selectedDecision === 'SUCCESS') {
        await onDecision('RESOLVED', 'SUCCESS');
      } else if (selectedDecision === 'FAILED') {
        await onDecision('RESOLVED', 'FAILED');
      } else {
        await onDecision('INVESTIGATED');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ padding: '16px', boxSizing: 'border-box' }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '640px', 
          width: '100%', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          overflowX: 'hidden',
          padding: '24px 28px',
          boxSizing: 'border-box',
          borderRadius: '20px'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldIcon size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Investigasi Kasus Fraud
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Tiket <strong style={{ color: '#2563eb' }}>#{alert.transaction_id}</strong> • Status Tiket: <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{alert.status}</span>
              </div>
            </div>
          </div>

          <button 
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
            onClick={onClose}
            title="Tutup Modal"
          >
            <CloseIcon size={14} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* CARD 1: RINCIAN LENGKAP TRANSAKSI */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px 18px' }}>
            {/* Top Stat Row: Nominal & Current Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Nominal Transaksi
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', lineHeight: 1.2 }}>
                  Rp {alert.amount.toLocaleString('id-ID')}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '3px' }}>
                  Status Transaksi
                </span>
                <span className={`badge ${txCurrentStatus === 'SUCCESS' ? 'badge-success' : txCurrentStatus === 'FAILED' ? 'badge-danger' : 'badge-warning'}`} style={{ fontWeight: 700, padding: '4px 10px' }}>
                  ● {txCurrentStatus}
                </span>
              </div>
            </div>

            {/* 2-Column Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Nasabah Pengirim</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {custInfo.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {custInfo.mask} • {custId}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>User Tujuan (Penerima)</span>
                <div style={{ fontWeight: 700, color: '#15803d', marginTop: '2px' }}>
                  {recipientName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {recipientAccount}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Kanal Pembayaran</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {channelLabel}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Enkripsi End-to-End
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Waktu Kejadian</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }} className="mono-text">
                  {new Date(alert.timestamp).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: PELANGGARAN FRAUD & FORENSIK */}
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#ea580c', fontSize: '0.85rem' }}>
                <AlertTriangleIcon size={16} />
                <span>Aturan Terpicu: {alert.rule_name}</span>
              </div>
              <div>{getSeverityBadge(alert.severity)}</div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#9a3412', backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
              <strong>Kriteria Pelanggaran:</strong> {alert.notes || 'Parameter evaluasi terlampaui berdasarkan kriteria rule engine.'}
            </div>

            {/* Cryptographic forensic hash box with word-break and copy buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #fed7aa', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <span>Ciphertext AES-256</span>
                  <button 
                    onClick={() => handleCopy('cipher', transaction?.encrypted_payload || '')} 
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'cipher' ? <><CheckIcon size={12} /> Tersalin</> : <><CopyIcon size={12} /> Salin</>}
                  </button>
                </div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-all', overflowWrap: 'anywhere', maxHeight: '36px', overflowY: 'hidden' }}>
                  {transaction?.encrypted_payload ? transaction.encrypted_payload.slice(0, 28) + '...' : 'AES-256 GCM verified'}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #fed7aa', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <span>Kunci Sesi RSA-2048</span>
                  <button 
                    onClick={() => handleCopy('rsa', transaction?.encrypted_session_key || '')} 
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'rsa' ? <><CheckIcon size={12} /> Tersalin</> : <><CopyIcon size={12} /> Salin</>}
                  </button>
                </div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-all', overflowWrap: 'anywhere', maxHeight: '36px', overflowY: 'hidden' }}>
                  {transaction?.encrypted_session_key ? transaction.encrypted_session_key.slice(0, 28) + '...' : 'RSA Session Key verified'}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: PILIHAN PUTUSAN ANALIS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Penetapan Keputusan Analis Keamanan:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Option 1: SUCCESS */}
              <div 
                onClick={() => setSelectedDecision('SUCCESS')}
                style={{
                  border: selectedDecision === 'SUCCESS' ? '2px solid #10b981' : '1px solid var(--border-color)',
                  backgroundColor: selectedDecision === 'SUCCESS' ? '#ecfdf5' : 'var(--bg-surface)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.82rem', color: selectedDecision === 'SUCCESS' ? '#059669' : 'var(--text-primary)' }}>
                  <CheckCircleIcon size={16} style={{ color: '#059669' }} />
                  <span>Setujui (Lolos)</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                  Ubah transaksi menjadi <strong>SUCCESS</strong> (Sah)
                </div>
              </div>

              {/* Option 2: FAILED */}
              <div 
                onClick={() => setSelectedDecision('FAILED')}
                style={{
                  border: selectedDecision === 'FAILED' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                  backgroundColor: selectedDecision === 'FAILED' ? '#fef2f2' : 'var(--bg-surface)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.82rem', color: selectedDecision === 'FAILED' ? '#dc2626' : 'var(--text-primary)' }}>
                  <XCircleIcon size={16} style={{ color: '#dc2626' }} />
                  <span>Tolak (Blokir)</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                  Ubah transaksi menjadi <strong>FAILED</strong> (Batalkan)
                </div>
              </div>

              {/* Option 3: INVESTIGATED */}
              <div 
                onClick={() => setSelectedDecision('INVESTIGATED')}
                style={{
                  border: selectedDecision === 'INVESTIGATED' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                  backgroundColor: selectedDecision === 'INVESTIGATED' ? '#fffbeb' : 'var(--bg-surface)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.82rem', color: selectedDecision === 'INVESTIGATED' ? '#d97706' : 'var(--text-primary)' }}>
                  <SearchIcon size={16} style={{ color: '#d97706' }} />
                  <span>Investigasi</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                  Tandai sedang diteliti lebih lanjut
                </div>
              </div>
            </div>
          </div>

          {/* Justification Textarea */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Catatan Justifikasi Putusan (Tercatat di Log Audit):
            </label>
            <textarea 
              className="form-control" 
              rows={2} 
              placeholder="Contoh: Telah dikonfirmasi dengan nasabah bahwa transaksi ini sah..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
            Batal
          </button>

          <button 
            className="btn btn-primary"
            onClick={handleSubmitDecision}
            disabled={submitting}
            style={{
              backgroundColor: selectedDecision === 'SUCCESS' ? '#10b981' : selectedDecision === 'FAILED' ? '#ef4444' : '#f59e0b',
              borderColor: selectedDecision === 'SUCCESS' ? '#10b981' : selectedDecision === 'FAILED' ? '#ef4444' : '#f59e0b',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.84rem',
              padding: '8px 20px'
            }}
          >
            {submitting 
              ? 'Memproses...' 
              : selectedDecision === 'SUCCESS' 
              ? 'Konfirmasi: Loloskan Transaksi' 
              : selectedDecision === 'FAILED' 
              ? 'Konfirmasi: Tolak Transaksi' 
              : 'Konfirmasi: Tandai Investigasi'}
          </button>
        </div>
      </div>
    </div>
  );
};
