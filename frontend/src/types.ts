export interface Transaction {
  id: number;
  transaction_id: string;
  timestamp: string;
  customer_id: string;
  amount: number;
  channel: string;
  recipient_name?: string;
  recipient_account?: string;
  encrypted_payload: string;
  encrypted_session_key: string;
  iv: string;
  tag: string;
  status: 'SUCCESS' | 'SUSPICIOUS' | string;
}

export interface FraudAlert {
  id: number;
  transaction_id: string;
  timestamp: string;
  rule_id: number;
  rule_name: string;
  amount: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status: 'PENDING' | 'INVESTIGATED' | 'RESOLVED' | string;
  notes: string | null;
}

export interface FraudRule {
  id: number;
  name: string;
  parameter: string;
  operator: string;
  threshold: string;
  severity: string;
  is_active: boolean;
  description: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  source_ip: string;
  status: string;
  details: string;
}

export interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  avg_encryption_time_ms: number;
  avg_decryption_time_ms: number;
  total_transactions_processed: number;
  throughput_tps: number;
}

export interface EncryptResult {
  ciphertext: string;
  iv: string;
  tag: string;
  encrypted_session_key: string;
}

export interface DecryptPayload {
  ciphertext: string;
  iv: string;
  tag: string;
  encrypted_session_key: string;
}

export interface CryptoBenchmarkResult {
  payload_size_kb: number;
  payload_size_bytes: number;
  aes_time_ms: number;
  rsa_time_ms: number;
  hybrid_time_ms: number;
  aes_throughput_tps: number;
  hybrid_throughput_tps: number;
  rsa_throughput_tps: number;
  ciphertext_size_bytes: number;
  iterations: number;
}

export interface ConfusionMatrixResult {
  total_samples: number;
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  accuracy_pct: number;
  precision_pct: number;
  recall_pct: number;
  f1_score_pct: number;
  rule_trigger_counts: Record<string, number>;
  evaluated_at: string;
  details: Array<{
    id: string;
    customer_id: string;
    amount: number;
    channel: string;
    ground_truth: string;
    predicted_status: string;
    verdict: string;
    triggered_rules: string;
  }>;
}

export interface TamperTestResult {
  original_plaintext: string;
  original_ciphertext: string;
  tampered_ciphertext: string;
  iv: string;
  tag: string;
  tampered_byte_index: number;
  tamper_detected: boolean;
  security_status: string;
  security_message: string;
  detection_latency_ms: number;
}

export interface KeyRotationResult {
  status: string;
  key_algorithm: string;
  key_fingerprint: string;
  rotated_at: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  reason: string;
  transaction_id?: string;
  customer_id?: string;
  amount?: number;
  channel?: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  timestamp: string;
  isRead: boolean;
  rule_name?: string;
  status?: string;
}
