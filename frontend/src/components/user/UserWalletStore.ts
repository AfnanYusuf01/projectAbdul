import type { UserProfileData, UserTransactionItem, GeneratedQRIS, GeneratedVA } from './UserTypes';

import { REGISTERED_USERS } from './UserDirectoryData';
import type { RegisteredRecipientInfo } from './UserDirectoryData';

export { REGISTERED_USERS };
export type { RegisteredRecipientInfo };

export const ALL_RECIPIENTS: RegisteredRecipientInfo[] = [...REGISTERED_USERS];
export interface UserWalletState {
  balance: number;
  transactions: UserTransactionItem[];
}

const LEDGER_STORAGE_KEY = 'jpay_multi_user_ledger_v2';
const GENERATED_QRIS_KEY = 'jpay_generated_qris_v2';
const GENERATED_VA_KEY = 'jpay_generated_va_v2';

const DEFAULT_AFNAN_TXS: UserTransactionItem[] = [
  {
    id: 'JAT-TX-9902',
    title: 'Isi Saldo',
    category: 'topup',
    timestamp: new Date().toISOString(),
    displayDate: '09 Okt 2026 • 18:26',
    amount: 500000,
    type: 'in',
    channel: 'BRI',
    recipientName: 'Afnan Yusuf',
    recipientAccount: '081234567890',
    status: 'SUCCESS',
    notes: 'Top up via BRI Virtual Account'
  },
  {
    id: 'JAT-TX-9906',
    title: 'Kirim ke CATURNUSA',
    category: 'transfer',
    timestamp: new Date().toISOString(),
    displayDate: '03 Okt 2026 • 17:57',
    amount: 109950,
    type: 'out',
    channel: 'J-Pay',
    recipientName: 'Caturnusa',
    recipientAccount: '021001092834',
    status: 'SUCCESS'
  },
  {
    id: 'JAT-TX-9907',
    title: 'Kirim ke LUCIANA CHEN',
    category: 'transfer',
    timestamp: new Date().toISOString(),
    displayDate: '03 Okt 2026 • 17:56',
    amount: 885000,
    type: 'out',
    channel: 'BCA',
    recipientName: 'Luciana Chen',
    recipientAccount: '522039182300',
    status: 'SUCCESS'
  }
];

function createDefaultLedger(): Record<string, UserWalletState> {
  const ledger: Record<string, UserWalletState> = {};
  REGISTERED_USERS.forEach((u) => {
    ledger[u.phone] = {
      balance: u.initialBalance,
      transactions: u.phone === '081234567890' ? [...DEFAULT_AFNAN_TXS] : [
        {
          id: 'JAT-INIT-' + u.id,
          title: 'Saldo Awal J-Pay',
          category: 'topup',
          timestamp: new Date().toISOString(),
          displayDate: '01 Okt 2026 • 09:00',
          amount: u.initialBalance,
          type: 'in',
          channel: u.defaultBank,
          recipientName: u.name,
          recipientAccount: u.phone,
          status: 'SUCCESS',
          notes: 'Aktivasi saldo akun J-Pay'
        }
      ]
    };
  });
  return ledger;
}

export function loadFullLedger(): Record<string, UserWalletState> {
  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all registered users exist in ledger
      const defaults = createDefaultLedger();
      return { ...defaults, ...parsed };
    }
  } catch {
    // Fallback
  }
  const initial = createDefaultLedger();
  localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}


export function getUserWallet(phone: string): UserWalletState {
  const ledger = loadFullLedger();
  if (!ledger[phone]) {
    ledger[phone] = {
      balance: 5000000,
      transactions: []
    };
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
  }
  return ledger[phone];
}

/**
 * Matches a recipient by name, phone, ID, or VA/bank account number to a registered J-Pay user
 */
export function findRegisteredUserRecipient(identifier: string): RegisteredRecipientInfo | undefined {
  if (!identifier) return undefined;
  const clean = identifier.trim().toLowerCase();
  return REGISTERED_USERS.find((u) => {
    const nameMatch = clean.includes(u.name.toLowerCase());
    const idMatch = clean.includes(u.id.toLowerCase());
    const phoneMatch = clean.includes(u.phone);
    const acctMatch = clean.includes(u.account.slice(0, 10));
    return nameMatch || idMatch || phoneMatch || acctMatch;
  });
}

export function recordInterUserTransaction(params: {
  txId: string;
  sender: UserProfileData;
  title: string;
  category: 'transfer' | 'topup' | 'qris' | 'va';
  recipientName: string;
  recipientAccount: string;
  channel: string;
  amount: number;
  status: 'SUCCESS' | 'SUSPICIOUS';
  notes?: string;
  encryptedPayload?: string;
}): {
  updatedSenderWallet: UserWalletState;
  createdItem: UserTransactionItem;
  creditedRecipient?: string;
} {
  const ledger = loadFullLedger();
  const senderPhone = params.sender.phone;
  if (!ledger[senderPhone]) {
    ledger[senderPhone] = { balance: 25450000, transactions: [] };
  }

  const nowStr =
    new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' • ' +
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // 1. Update Sender Balance & History
  if (params.category === 'topup') {
    ledger[senderPhone].balance += params.amount;
  } else {
    ledger[senderPhone].balance = Math.max(0, ledger[senderPhone].balance - params.amount);
  }

  const senderTxItem: UserTransactionItem = {
    id: params.txId,
    title: params.title,
    category: params.category,
    timestamp: new Date().toISOString(),
    displayDate: nowStr,
    amount: params.amount,
    type: params.category === 'topup' ? 'in' : 'out',
    channel: params.channel,
    recipientName: params.recipientName,
    recipientAccount: params.recipientAccount,
    status: params.status,
    notes: params.notes,
    encryptedPayload: params.encryptedPayload
  };

  ledger[senderPhone].transactions = [senderTxItem, ...ledger[senderPhone].transactions];

  // 2. If it's an outgoing payment (transfer, qris, va), check if recipient is another Registered User!
  let creditedRecipient: string | undefined;
  if (params.category !== 'topup') {
    const targetUser =
      findRegisteredUserRecipient(params.recipientName) ||
      findRegisteredUserRecipient(params.recipientAccount);

    if (targetUser && targetUser.phone !== senderPhone) {
      if (!ledger[targetUser.phone]) {
        ledger[targetUser.phone] = { balance: targetUser.initialBalance, transactions: [] };
      }

      // Credit recipient balance immediately
      ledger[targetUser.phone].balance += params.amount;

      const methodLabel =
        params.category === 'qris' ? 'QRIS' :
        params.category === 'va' ? `VA ${params.channel}` :
        params.channel;

      const recipientTxItem: UserTransactionItem = {
        id: params.txId,
        title: `Terima dari ${params.sender.name.toUpperCase()}`,
        category: params.category,
        timestamp: new Date().toISOString(),
        displayDate: nowStr,
        amount: params.amount,
        type: 'in',
        channel: methodLabel,
        recipientName: params.sender.name,
        recipientAccount: params.sender.phone,
        status: params.status,
        notes: params.notes
          ? `Terima dana (${methodLabel}): ${params.notes}`
          : `Dana masuk dari ${params.sender.name} via ${methodLabel}`,
        encryptedPayload: params.encryptedPayload
      };

      ledger[targetUser.phone].transactions = [
        recipientTxItem,
        ...ledger[targetUser.phone].transactions
      ];
      creditedRecipient = targetUser.name;
    }
  }

  localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
  fetch('/api/mobile-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ledger })
  }).catch(() => {});

  return {
    updatedSenderWallet: ledger[senderPhone],
    createdItem: senderTxItem,
    creditedRecipient
  };
}

// Shared Generated QRIS & VA Storage (Synced between Laptop & Handphone via /api/mobile-sync)
export function saveGeneratedQRIS(qr: GeneratedQRIS): void {
  try {
    const existing = loadGeneratedQRISList();
    const updated = [qr, ...existing.slice(0, 9)];
    localStorage.setItem(GENERATED_QRIS_KEY, JSON.stringify(updated));
    fetch('/api/mobile-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generated_qris: updated })
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function loadGeneratedQRISList(): GeneratedQRIS[] {
  try {
    const raw = localStorage.getItem(GENERATED_QRIS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGeneratedVA(va: GeneratedVA): void {
  try {
    const existing = loadGeneratedVAList();
    const updated = [va, ...existing.slice(0, 9)];
    localStorage.setItem(GENERATED_VA_KEY, JSON.stringify(updated));
    fetch('/api/mobile-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generated_va: updated })
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function loadGeneratedVAList(): GeneratedVA[] {
  try {
    const raw = localStorage.getItem(GENERATED_VA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function syncMobileStateFromServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/mobile-sync').catch(() => null);
    if (!res || !res.ok) return false;
    const data = await res.json();
    let changed = false;
    if (data.ledger) {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(data.ledger));
      changed = true;
    }
    if (Array.isArray(data.generated_qris) && data.generated_qris.length > 0) {
      localStorage.setItem(GENERATED_QRIS_KEY, JSON.stringify(data.generated_qris));
      changed = true;
    }
    if (Array.isArray(data.generated_va) && data.generated_va.length > 0) {
      localStorage.setItem(GENERATED_VA_KEY, JSON.stringify(data.generated_va));
      changed = true;
    }
    return changed;
  } catch {
    return false;
  }
}
