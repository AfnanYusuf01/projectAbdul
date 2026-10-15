import React from 'react';
import type { UserTransactionItem } from './UserTypes';

interface UserReceiptModalProps {
  transaction: UserTransactionItem | null;
  onClose: () => void;
}

export const UserReceiptModal: React.FC<UserReceiptModalProps> = ({
  transaction,
  onClose
}) => {
  if (!transaction) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 600,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '24px 20px 28px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxHeight: '90%',
        overflowY: 'auto',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.2)'
      }}>
        {/* Status Icon & Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 900
          }}>
            ✓
          </div>

          <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#166534' }}>
            {transaction.type === 'in' ? 'Dana Berhasil Diterima' : 'Pembayaran Berhasil'}
          </div>

          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--jpay-text-main)', letterSpacing: '-0.5px' }}>
            Rp {transaction.amount.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Receipt Details Breakdown */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '14px 16px',
          border: '1px solid var(--jpay-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--jpay-text-muted)' }}>No. Referensi</span>
            <span style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--jpay-text-main)' }}>
              {transaction.id}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--jpay-text-muted)' }}>Waktu Transaksi</span>
            <span style={{ fontWeight: 600, color: 'var(--jpay-text-main)' }}>
              {transaction.displayDate}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--jpay-text-muted)' }}>Metode Pembayaran</span>
            <span style={{ fontWeight: 700, color: 'var(--jpay-primary)', textTransform: 'uppercase' }}>
              {transaction.channel}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--jpay-text-muted)' }}>
              {transaction.type === 'in' ? 'Pengirim' : 'Penerima'}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--jpay-text-main)' }}>
              {transaction.recipientName}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--jpay-text-muted)' }}>Biaya Admin</span>
            <span style={{ fontWeight: 700, color: '#10b981' }}>
              Rp 0 (Gratis)
            </span>
          </div>

          {transaction.notes && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--jpay-text-muted)' }}>Catatan</span>
              <span style={{ color: 'var(--jpay-text-main)', fontWeight: 600 }}>
                {transaction.notes}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: 'var(--jpay-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '13px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
