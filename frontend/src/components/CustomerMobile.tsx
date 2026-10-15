import React from 'react';
import type { Transaction, FraudRule } from '../types';
import { UserGenerateQRISVA } from './user/UserGenerateQRISVA';
import './user/UserApp.css';

interface CustomerMobileProps {
  onSendTransaction: (txData: { 
    customer_id: string; 
    amount: number; 
    channel: string; 
    recipient_name?: string; 
    recipient_account?: string; 
  }) => Promise<Transaction>;
  mockRules: FraudRule[];
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
  onSwitchToSocPortal?: () => void;
}

export const CustomerMobile: React.FC<CustomerMobileProps> = ({
  onNotify
}) => {
  return (
    <div className="view-container animate-fade-in" style={{ padding: '24px 32px' }}>
      <div className="view-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="view-header-title">Generator QRIS & Virtual Account</h2>
          <p className="view-header-desc">
            Buat kode pembayaran QRIS Dinamis (.PNG) dan Nomor Virtual Account untuk nasabah J-Pay terdaftar.
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '520px',
        margin: '0 auto',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        border: '1px solid var(--border-color)',
        backgroundColor: '#ffffff'
      }}>
        <UserGenerateQRISVA
          currentUserPhone=""
          onBack={() => {}}
          onSimulatePayGenerated={() => {
            onNotify?.('success', 'Berhasil Dibuat', 'Tagihan QRIS / VA telah siap dibayar oleh nasabah.');
          }}
        />
      </div>
    </div>
  );
};
