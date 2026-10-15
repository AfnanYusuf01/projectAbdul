import type { FraudRule, AuditLog, EncryptResult, Transaction, FraudAlert, SystemNotification } from './types';

export const INITIAL_MOCK_RULES: FraudRule[] = [
  {
    id: 1,
    name: "Batas Nominal Maksimum",
    parameter: "amount",
    operator: ">",
    threshold: "10000000",
    severity: "HIGH",
    is_active: true,
    description: "Menandai transaksi tunggal yang nominalnya melebihi Rp 10.000.000."
  },
  {
    id: 2,
    name: "Transaksi Jam Pemeliharaan",
    parameter: "hour",
    operator: "in_range",
    threshold: "2-4",
    severity: "MEDIUM",
    is_active: true,
    description: "Menandai transaksi bernilai sedang/tinggi yang dilakukan pada jam pemeliharaan (02.00-04.00 WIB)."
  },
  {
    id: 3,
    name: "Velocity Limit (Frekuensi)",
    parameter: "velocity",
    operator: ">",
    threshold: "5",
    severity: "HIGH",
    is_active: true,
    description: "Mendeteksi serangan spam jika pelanggan melakukan > 5 transaksi dalam kurun waktu 1 menit."
  }
];

export const INITIAL_MOCK_LOGS: AuditLog[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 360000).toISOString(),
    user: 'System',
    action: 'STARTUP',
    source_ip: '127.0.0.1',
    status: 'SUCCESS',
    details: 'Sistem keamanan transaksi Jatelindo diaktifkan.'
  }
];

export const localEncrypt = (text: string): EncryptResult => {
  const encKey = btoa('aes-session-key-' + Math.random().toString(36).slice(-8));
  const cipher = btoa(text);
  return {
    ciphertext: cipher,
    iv: btoa('iv-vector-12b'),
    tag: btoa('gcm-tag-verify'),
    encrypted_session_key: encKey
  };
};

export const simulateOfflineBurst = (
  count: number,
  mockTransactions: Transaction[],
  mockAlerts: FraudAlert[],
  mockRules: FraudRule[],
  mockLogs: AuditLog[]
) => {
  const channels = ["QRIS", "Virtual Account", "E-Wallet", "Credit Card"];
  const customers = ["CUST-109", "CUST-304", "CUST-982", "CUST-441"];
  const mockRecipients = [
    { name: "Luciana Chen", account: "522039182300" },
    { name: "Caturnusa", account: "021001092834" },
    { name: "Budi Santoso", account: "880813889900" },
    { name: "Afnan Yusuf", account: "1800015394804" },
    { name: "Kopi Kenangan (QRIS)", account: "QRIS-ID-88392" },
    { name: "Indomaret Point (QRIS)", account: "QRIS-ID-55102" },
    { name: "Luciana Chen (BCA VA)", account: "8001081987654321" },
    { name: "PLN Pascabayar (VA)", account: "88019283741009" },
  ];
  
  let localTxs = [...mockTransactions];
  let localAlerts = [...mockAlerts];
  let localLogs = [...mockLogs];

  for (let i = 0; i < count; i++) {
    const cust = customers[Math.floor(Math.random() * customers.length)];
    const rec = mockRecipients[Math.floor(Math.random() * mockRecipients.length)];
    const amount = Math.random() < 0.20 
      ? Math.floor(Math.random() * 15000000 + 10000001)
      : Math.floor(Math.random() * 500000 + 10000);
    const ch = channels[Math.floor(Math.random() * channels.length)];
    const tx_id = `JAT-SIM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*9000+1000)}`;

    const triggeredRules: FraudRule[] = [];
    const activeRules = mockRules.filter(r => r.is_active);
    activeRules.forEach(rule => {
      if (rule.parameter === 'amount' && amount > parseFloat(rule.threshold)) {
        triggeredRules.push(rule);
      }
      if (rule.parameter === 'velocity' && count > parseInt(rule.threshold) && i > parseInt(rule.threshold)) {
        triggeredRules.push(rule);
      }
    });

    const isSuspicious = triggeredRules.length > 0;
    const payloadText = JSON.stringify({ 
      customer_id: cust, 
      recipient_name: rec.name, 
      recipient_account: rec.account, 
      amount, 
      channel: ch 
    });
    const cryptoData = localEncrypt(payloadText);

    const newTx: Transaction = {
      id: localTxs.length + 1,
      transaction_id: tx_id,
      timestamp: new Date().toISOString(),
      customer_id: cust,
      amount,
      channel: ch,
      recipient_name: rec.name,
      recipient_account: rec.account,
      encrypted_payload: cryptoData.ciphertext,
      encrypted_session_key: cryptoData.encrypted_session_key,
      iv: cryptoData.iv,
      tag: cryptoData.tag,
      status: isSuspicious ? 'SUSPICIOUS' : 'SUCCESS'
    };

    localTxs.unshift(newTx);

    if (isSuspicious) {
      triggeredRules.forEach(rule => {
        const alertItem: FraudAlert = {
          id: localAlerts.length + 1,
          transaction_id: tx_id,
          timestamp: new Date().toISOString(),
          rule_id: rule.id,
          rule_name: rule.name,
          amount,
          severity: rule.severity,
          status: 'PENDING',
          notes: `Kriteria terpicu: ${rule.parameter} ${rule.operator} ${rule.threshold}`
        };
        localAlerts.unshift(alertItem);
      });
    }
  }

  return {
    transactions: localTxs,
    alerts: localAlerts,
    logs: localLogs
  };
};

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Transaksi Mencurigakan Terdeteksi',
    reason: 'Nominal transaksi Rp 48.000.000 melanggar aturan "Batas Nominal Maksimum" (Threshold: > Rp 10.000.000).',
    transaction_id: 'JAT-TX-8764',
    customer_id: 'CUST-109',
    amount: 48000000,
    channel: 'Virtual Account',
    severity: 'HIGH',
    timestamp: '10 Okt 14:20 WIB',
    isRead: false,
    rule_name: 'Batas Nominal Maksimum',
    status: 'PENDING'
  },
  {
    id: 'notif-2',
    title: 'Anomali Jam Pemeliharaan',
    reason: 'Transaksi bernilai sedang dilakukan pada jam 02:45 WIB selama jendela pemeliharaan sistem perbankan.',
    transaction_id: 'JAT-TX-9921',
    customer_id: 'CUST-304',
    amount: 5200000,
    channel: 'QRIS',
    severity: 'MEDIUM',
    timestamp: '10 Okt 02:45 WIB',
    isRead: false,
    rule_name: 'Transaksi Jam Pemeliharaan',
    status: 'PENDING'
  },
  {
    id: 'notif-3',
    title: 'Spam Velocity Limit Terpicu',
    reason: 'Pelanggan melakukan 6 transaksi dalam kurun waktu kurang dari 60 detik (Threshold: > 5 tx/menit).',
    transaction_id: 'JAT-TX-4412',
    customer_id: 'CUST-982',
    amount: 850000,
    channel: 'E-Wallet',
    severity: 'HIGH',
    timestamp: '10 Okt 11:05 WIB',
    isRead: true,
    rule_name: 'Velocity Limit (Frekuensi)',
    status: 'RESOLVED'
  }
];

export const mockRotateKey = () => ({
  status: "KEY_ROTATED_SUCCESS",
  key_algorithm: "RSA-2048",
  key_fingerprint: "SHA256:e8b2f9a17c3d",
  rotated_at: new Date().toISOString()
});

export const mockRunBenchmark = (sizeKb: number) => ({
  payload_size_kb: sizeKb,
  payload_size_bytes: sizeKb * 1024,
  aes_time_ms: 0.12,
  rsa_time_ms: 8.45,
  hybrid_time_ms: 0.38,
  aes_throughput_tps: 8333.3,
  hybrid_throughput_tps: 2631.5,
  rsa_throughput_tps: 118.3,
  ciphertext_size_bytes: sizeKb * 1024 + 16,
  iterations: 25
});

export const mockEvaluateDataset = () => ({
  total_samples: 100,
  true_positives: 29,
  true_negatives: 68,
  false_positives: 2,
  false_negatives: 1,
  accuracy_pct: 97.0,
  precision_pct: 93.5,
  recall_pct: 96.6,
  f1_score_pct: 95.0,
  rule_trigger_counts: { "Batas Nominal Maksimum": 10, "Transaksi Jam Pemeliharaan": 10, "Velocity Limit (Frekuensi)": 9 },
  evaluated_at: new Date().toISOString(),
  details: []
});

export const mockTamperTest = (text: string) => ({
  original_plaintext: text,
  original_ciphertext: "dHJhbnMtMTAyLTQ4MDAwMDAw",
  tampered_ciphertext: "eHJhbnMtMTAyLTQ4MDAwMDAw",
  iv: "aXYtdmVjdG9yLTEyYg==",
  tag: "Z2NtLXRhZy12ZXJpZnk=",
  tampered_byte_index: 0,
  tamper_detected: true,
  security_status: "BLOCKED_INTEGRITY_VIOLATION",
  security_message: "[SECURITY ALERT] Authentication Tag Mismatch: Data telah dimanipulasi saat transmisi. Dekripsi ditolak seketika oleh AES-GCM.",
  detection_latency_ms: 0.35
});

export const simulateOfflineSingleTransaction = (
  txData: { 
    customer_id: string; 
    amount: number; 
    channel: string; 
    recipient_name?: string; 
    recipient_account?: string; 
  },
  mockTransactions: Transaction[],
  mockAlerts: FraudAlert[],
  mockRules: FraudRule[],
  mockLogs: AuditLog[]
) => {
  const ch = txData.channel;
  const cust = txData.customer_id;
  const amount = txData.amount;
  const recName = txData.recipient_name || (ch.includes('QRIS') ? 'Kopi Kenangan (QRIS)' : 'Luciana Chen');
  const recAcc = txData.recipient_account || (ch.includes('QRIS') ? 'QRIS-ID-88392' : '522039182300');
  const tx_id = `JAT-MOB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*9000+1000)}`;

  const triggeredRules: FraudRule[] = [];
  mockRules.filter(r => r.is_active).forEach(rule => {
    if (rule.parameter === 'amount' && amount > parseFloat(rule.threshold)) {
      triggeredRules.push(rule);
    }
  });

  const isSuspicious = triggeredRules.length > 0;
  const cryptoData = localEncrypt(JSON.stringify({ 
    customer_id: cust, 
    recipient_name: recName, 
    recipient_account: recAcc, 
    amount, 
    channel: ch 
  }));

  const newTx: Transaction = {
    id: mockTransactions.length + 1,
    transaction_id: tx_id,
    timestamp: new Date().toISOString(),
    customer_id: cust,
    amount,
    channel: ch,
    recipient_name: recName,
    recipient_account: recAcc,
    encrypted_payload: cryptoData.ciphertext,
    encrypted_session_key: cryptoData.encrypted_session_key,
    iv: cryptoData.iv,
    tag: cryptoData.tag,
    status: isSuspicious ? 'SUSPICIOUS' : 'SUCCESS'
  };

  const newAlerts = [...mockAlerts];
  if (isSuspicious) {
    triggeredRules.forEach(rule => {
      newAlerts.unshift({
        id: newAlerts.length + 1,
        transaction_id: tx_id,
        timestamp: new Date().toISOString(),
        rule_id: rule.id,
        rule_name: rule.name,
        amount,
        severity: rule.severity,
        status: 'PENDING',
        notes: `Kriteria terpicu secara lokal: ${rule.parameter} ${rule.operator} ${rule.threshold}`
      });
    });
  }

  const newLogs: AuditLog[] = [
    {
      id: mockLogs.length + 1,
      timestamp: new Date().toISOString(),
      user: 'API_Client',
      action: 'CREATE_TRANSACTION',
      source_ip: '127.0.0.1',
      status: 'SUCCESS',
      details: `Membuat transaksi ${tx_id} via JatelindoPay`
    },
    ...mockLogs
  ];

  return {
    newTx,
    transactions: [newTx, ...mockTransactions],
    alerts: newAlerts,
    logs: newLogs
  };
};
