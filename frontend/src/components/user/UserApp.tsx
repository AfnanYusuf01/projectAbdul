import React, { useState, useEffect } from 'react';
import type { UserProfileData, UserScreen, UserTransactionItem } from './UserTypes';
import type { Transaction } from '../../types';
import { UserLogin } from './UserLogin';
import { UserHome } from './UserHome';
import { UserHistory } from './UserHistory';
import { UserQRISPay } from './UserQRISPay';
import { UserVATransfer } from './UserVATransfer';
import { UserTransfer } from './UserTransfer';
import { UserProfile } from './UserProfile';
import { UserPinModal } from './UserPinModal';
import { UserReceiptModal } from './UserReceiptModal';
import { getUserWallet, recordInterUserTransaction, syncMobileStateFromServer } from './UserWalletStore';
import './UserApp.css';

interface UserAppProps {
  onSendTransaction: (txData: { 
    customer_id: string; 
    amount: number; 
    channel: string; 
    recipient_name?: string; 
    recipient_account?: string; 
  }) => Promise<Transaction>;
  onNotify?: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
}

const SCREEN_TO_PATH: Record<UserScreen, string> = {
  home: '/demo-mobile/home',
  history: '/demo-mobile/history',
  qris_pay: '/demo-mobile/qris',
  transfer_bank: '/demo-mobile/transfer',
  transfer_va: '/demo-mobile/va',
  generate_qris_va: '/demo-mobile/home',
  profile: '/demo-mobile/profile',
  topup: '/demo-mobile/home'
};

const PATH_TO_SCREEN: Record<string, UserScreen> = {
  '/demo-mobile': 'home',
  '/demo-mobile/': 'home',
  '/demo-mobile/home': 'home',
  '/demo-mobile/history': 'history',
  '/demo-mobile/qris': 'qris_pay',
  '/demo-mobile/transfer': 'transfer_bank',
  '/demo-mobile/va': 'transfer_va',
  '/demo-mobile/profile': 'profile'
};

export const UserApp: React.FC<UserAppProps> = ({
  onSendTransaction
}) => {
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth <= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [user, setUser] = useState<UserProfileData | null>(() => {
    if (window.location.pathname === '/demo-mobile/login') return null;
    const saved = sessionStorage.getItem('jpay_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [balance, setBalance] = useState<number>(() => {
    if (!user) return 25450000;
    return getUserWallet(user.phone).balance;
  });
  const [screen, setScreen] = useState<UserScreen>(() => {
    return PATH_TO_SCREEN[window.location.pathname] || 'home';
  });
  const [transactions, setTransactions] = useState<UserTransactionItem[]>(() => {
    if (!user) return [];
    return getUserWallet(user.phone).transactions;
  });

  useEffect(() => {
    const refreshFromServer = async () => {
      await syncMobileStateFromServer();
      if (user) {
        const wallet = getUserWallet(user.phone);
        setBalance(wallet.balance);
        setTransactions(wallet.transactions);
      }
    };
    refreshFromServer();
    const interval = setInterval(refreshFromServer, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const navigateToScreen = (nextScreen: UserScreen) => {
    setScreen(nextScreen);
    const nextPath = SCREEN_TO_PATH[nextScreen] || '/demo-mobile/home';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  useEffect(() => {
    if (!user && window.location.pathname.startsWith('/demo-mobile') && window.location.pathname !== '/demo-mobile/login') {
      window.history.replaceState({}, '', '/demo-mobile/login');
    }

    const handlePopState = () => {
      if (window.location.pathname === '/demo-mobile/login') {
        setUser(null);
      } else {
        const matched = PATH_TO_SCREEN[window.location.pathname];
        if (matched) setScreen(matched);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const [pendingTx, setPendingTx] = useState<{
    title: string;
    category: 'transfer' | 'topup' | 'qris' | 'va';
    recipientName: string;
    recipientAccount: string;
    channel: string;
    amount: number;
    notes?: string;
  } | null>(null);

  const [isPinOpen, setIsPinOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<UserTransactionItem | null>(null);
  const [sendChoiceOpen, setSendChoiceOpen] = useState(false);
  const [isUnderDevOpen, setIsUnderDevOpen] = useState(false);

  const queuePayment = (tx: NonNullable<typeof pendingTx>) => {
    if (tx.amount > balance && tx.category !== 'topup') {
      alert('Saldo J-Pay Anda tidak mencukupi untuk transaksi ini.');
      return;
    }
    setPendingTx(tx);
    setIsPinOpen(true);
  };

  const executeVerifiedPayment = async () => {
    if (!pendingTx || !user) return;
    setIsPinOpen(false);

    try {
      const backendChannel = 
        pendingTx.category === 'qris' ? 'QRIS' :
        pendingTx.category === 'va' ? 'Virtual Account' :
        'E-Wallet';

      const apiRes = await onSendTransaction({
        customer_id: user.name,
        amount: pendingTx.amount,
        channel: backendChannel,
        recipient_name: pendingTx.recipientName,
        recipient_account: pendingTx.recipientAccount
      });
      const isSuspicious = apiRes.status === 'SUSPICIOUS';
      const txId = apiRes.transaction_id || ('JAT-' + Date.now().toString().slice(-6));

      const result = recordInterUserTransaction({
        txId,
        sender: user,
        title: pendingTx.title,
        category: pendingTx.category,
        recipientName: pendingTx.recipientName,
        recipientAccount: pendingTx.recipientAccount,
        channel: pendingTx.channel,
        amount: pendingTx.amount,
        status: isSuspicious ? 'SUSPICIOUS' : 'SUCCESS',
        notes: pendingTx.notes,
        encryptedPayload: apiRes.encrypted_payload
      });

      setBalance(result.updatedSenderWallet.balance);
      setTransactions(result.updatedSenderWallet.transactions);
      setActiveReceipt(result.createdItem);
      navigateToScreen('home');
      setPendingTx(null);
    } catch {
      alert('Gagal memproses transaksi.');
    }
  };

  // Enforce Mobile-Only Viewport (<= 500px)
  if (!isMobileViewport) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          maxWidth: '420px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '24px',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(2, 132, 199, 0.2)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px auto'
          }}>
            📱
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px', color: '#f8fafc' }}>
            Khusus Tampilan Handphone
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Aplikasi pengguna <strong>J-Pay</strong> hanya dapat dibuka melalui perangkat Handphone atau Mode Responsif Mobile pada browser (Tekan <strong>F12</strong> → Klik ikon <strong>Toggle Device Toolbar 📱</strong> dengan lebar layar ≤ 500px).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="jpay-viewport-wrapper">
      <div className="jpay-mobile-frame">
        {/* Main Screen Router */}
        {!user ? (
          <UserLogin
            onLoginSuccess={(loggedInUser) => {
              sessionStorage.setItem('jpay_user', JSON.stringify(loggedInUser));
              setUser(loggedInUser);
              navigateToScreen('home');
            }}
          />
        ) : (
          <>
            {(screen === 'home' || screen === 'qris_pay') && (
              <UserHome
                user={user}
                balance={balance}
                onNavigate={(next) => {
                  if (next === 'transfer_bank') {
                    setSendChoiceOpen(true);
                  } else {
                    navigateToScreen(next);
                  }
                }}
                onUnderDevelopment={() => setIsUnderDevOpen(true)}
              />
            )}

            {screen === 'history' && (
              <UserHistory
                transactions={transactions}
                onBack={() => navigateToScreen('home')}
                onSelectTransaction={(tx) => setActiveReceipt(tx)}
                onOpenGenerateQRIS={() => setIsUnderDevOpen(true)}
              />
            )}

            {screen === 'qris_pay' && (
              <UserQRISPay
                balance={balance}
                currentUserPhone={user.phone}
                onClose={() => navigateToScreen('home')}
                onPayQRIS={(merchantName, amount) => {
                  queuePayment({
                    title: `QRIS ke ${merchantName.toUpperCase()}`,
                    category: 'qris',
                    recipientName: merchantName,
                    recipientAccount: 'QRIS-USER',
                    channel: 'QRIS',
                    amount,
                    notes: `Pembayaran QRIS di ${merchantName}`
                  });
                }}
              />
            )}

            {screen === 'transfer_va' && (
              <UserVATransfer
                currentUserPhone={user.phone}
                onBack={() => navigateToScreen('home')}
                onConfirmVAPayment={(bankName, vaNumber, amount, recipientName) => {
                  queuePayment({
                    title: `VA ${bankName} - ${recipientName}`,
                    category: 'va',
                    recipientName,
                    recipientAccount: vaNumber,
                    channel: `${bankName} VA`,
                    amount,
                    notes: `Pembayaran Virtual Account ${vaNumber}`
                  });
                }}
              />
            )}

            {screen === 'transfer_bank' && (
              <UserTransfer
                balance={balance}
                currentUserPhone={user.phone}
                onBack={() => navigateToScreen('home')}
                onInitiateTransfer={(recipientName, bankName, accountNumber, amount, notes) => {
                  queuePayment({
                    title: `Kirim ke ${recipientName.toUpperCase()}`,
                    category: 'transfer',
                    recipientName,
                    recipientAccount: accountNumber,
                    channel: bankName,
                    amount,
                    notes
                  });
                }}
              />
            )}

            {screen === 'profile' && (
              <UserProfile
                user={user}
                balance={balance}
                onLogout={() => {
                  sessionStorage.removeItem('jpay_user');
                  setUser(null);
                  if (window.location.pathname.startsWith('/demo-mobile')) {
                    window.history.pushState({}, '', '/demo-mobile/login');
                  }
                }}
                onBackToHome={() => navigateToScreen('home')}
                onUnderDevelopment={() => setIsUnderDevOpen(true)}
              />
            )}

            {/* Send Method Bottom Sheet (Transfer Bank vs Virtual Account) */}
            {sendChoiceOpen && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                zIndex: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }} onClick={() => setSendChoiceOpen(false)}>
                <div style={{
                  backgroundColor: '#ffffff',
                  borderTopLeftRadius: '24px',
                  borderTopRightRadius: '24px',
                  padding: '20px 18px 28px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--jpay-text-main)', marginBottom: '4px' }}>
                    Kirim Uang
                  </div>

                  {/* Option 1: Transfer Rekening Bank */}
                  <button
                    onClick={() => { setSendChoiceOpen(false); navigateToScreen('transfer_bank'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid var(--jpay-border)',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      🏦
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>Kirim ke Rekening Bank</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--jpay-text-muted)' }}>Transfer ke Mandiri, BCA, BRI, atau Sesama J-Pay</div>
                    </div>
                    <span style={{ color: 'var(--jpay-primary)', fontWeight: 800 }}>›</span>
                  </button>

                  {/* Option 2: Transfer ke Virtual Account (VA) */}
                  <button
                    onClick={() => { setSendChoiceOpen(false); navigateToScreen('transfer_va'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid var(--jpay-border)',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      💳
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--jpay-text-main)' }}>Ke Virtual Account (VA)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--jpay-text-muted)' }}>Bayar ke nomor Virtual Account SeaBank, Mandiri, BCA</div>
                    </div>
                    <span style={{ color: 'var(--jpay-primary)', fontWeight: 800 }}>›</span>
                  </button>
                </div>
              </div>
            )}

            {/* In-App Modal: Fitur Dalam Masa Pengembangan */}
            {isUnderDevOpen && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                zIndex: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }} onClick={() => setIsUnderDevOpen(false)}>
                <div style={{
                  width: '100%',
                  maxWidth: '320px',
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    margin: '0 auto 12px auto'
                  }}>
                    ℹ️
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--jpay-text-main)', marginBottom: '6px' }}>
                    Dalam Masa Pengembangan
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--jpay-text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                    Fitur ini sedang dalam masa pengembangan dan akan segera hadir pada pembaruan berikutnya.
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUnderDevOpen(false)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--jpay-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '11px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Mengerti
                  </button>
                </div>
              </div>
            )}

            {/* 5-Tab Bottom Navigation Bar (Image #3) */}
            {(screen === 'home' || screen === 'history' || screen === 'profile') && (
              <nav className="jpay-bottom-nav">
                {/* 1. Home */}
                <button
                  className={`jpay-nav-tab ${screen === 'home' ? 'active' : ''}`}
                  onClick={() => navigateToScreen('home')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="jpay-nav-label">Home</span>
                </button>

                {/* 2. History (Aktivitas) */}
                <button
                  className={`jpay-nav-tab ${screen === 'history' ? 'active' : ''}`}
                  onClick={() => navigateToScreen('history')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span className="jpay-nav-label">History</span>
                </button>

                {/* 3. PAY (Floating Center QRIS Button) */}
                <button
                  className="jpay-pay-btn-wrap"
                  onClick={() => navigateToScreen('qris_pay')}
                >
                  <div className="jpay-pay-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <span className="jpay-pay-label">PAY</span>
                </button>

                {/* 4. Pocket (Dalam Masa Pengembangan) */}
                <button
                  className="jpay-nav-tab"
                  onClick={() => setIsUnderDevOpen(true)}
                  style={{ position: 'relative' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span className="jpay-nav-label">Pocket</span>
                </button>

                {/* 5. Me (Profile) */}
                <button
                  className={`jpay-nav-tab ${screen === 'profile' ? 'active' : ''}`}
                  onClick={() => navigateToScreen('profile')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="jpay-nav-label">Me</span>
                </button>
              </nav>
            )}

            {/* PIN Verification Modal */}
            <UserPinModal
              isOpen={isPinOpen}
              onClose={() => setIsPinOpen(false)}
              onConfirm={executeVerifiedPayment}
              amount={pendingTx?.amount || 0}
              recipientName={pendingTx?.recipientName || ''}
            />

            {/* Payment Receipt Modal */}
            <UserReceiptModal
              transaction={activeReceipt}
              onClose={() => setActiveReceipt(null)}
            />
          </>
        )}
      </div>
    </div>
  );
};
