export interface UserProfileData {
  phone: string;
  name: string;
  avatarUrl: string;
  isKycVerified: boolean;
  pin: string;
  accountNumber: string;
}

export interface UserTransactionItem {
  id: string;
  title: string;
  category: 'transfer' | 'topup' | 'qris' | 'va';
  timestamp: string; // ISO or readable
  displayDate: string; // '09 Okt 2026 • 18:27'
  amount: number;
  type: 'in' | 'out';
  channel: string; // 'MANDIRI', 'SEABANK', 'BCA', 'QRIS', 'J-PAY'
  recipientName: string;
  recipientAccount: string;
  status: 'SUCCESS' | 'SUSPICIOUS' | 'PENDING' | 'FAILED';
  notes?: string;
  encryptedPayload?: string;
}

export interface RecentRecipient {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  avatarLetter: string;
  color: string;
}

export interface GeneratedQRIS {
  id: string;
  merchantName: string;
  amount: number;
  notes: string;
  qrPayload: string;
  createdAt: string;
  expiresAt: string;
}

export interface GeneratedVA {
  id: string;
  bankName: string;
  vaNumber: string;
  targetUser: string;
  amount: number;
  notes: string;
  createdAt: string;
  expiresAt: string;
}

export type UserScreen = 
  | 'home' 
  | 'history' 
  | 'qris_pay' 
  | 'transfer_bank' 
  | 'transfer_va' 
  | 'generate_qris_va' 
  | 'profile' 
  | 'topup';
