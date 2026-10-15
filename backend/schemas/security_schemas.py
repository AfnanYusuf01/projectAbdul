from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# ----------------- Kriptografi Schemas -----------------
class EncryptRequest(BaseModel):
    plaintext: str = Field(..., description="Payload data transaksi teks terang (JSON/Text)")

class EncryptResponse(BaseModel):
    ciphertext: str
    iv: str
    tag: str
    encrypted_session_key: str

class DecryptRequest(BaseModel):
    ciphertext: str
    iv: str
    tag: str
    encrypted_session_key: str

class DecryptResponse(BaseModel):
    plaintext: str

# ----------------- Transaksi Schemas -----------------
class TransactionCreate(BaseModel):
    customer_id: str
    amount: float
    channel: str
    payload: str
    recipient_name: Optional[str] = None
    recipient_account: Optional[str] = None
class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    timestamp: datetime
    customer_id: str
    amount: float
    channel: str
    recipient_name: Optional[str] = None
    recipient_account: Optional[str] = None
    encrypted_payload: str
    encrypted_session_key: str
    iv: str
    tag: str
    status: str

    class Config:
        from_attributes = True

# ----------------- Fraud Rule Schemas -----------------
class FraudRuleCreate(BaseModel):
    name: str
    parameter: str
    operator: str
    threshold: str
    severity: str
    is_active: Optional[bool] = True
    description: Optional[str] = None

class FraudRuleResponse(BaseModel):
    id: int
    name: str
    parameter: str
    operator: str
    threshold: str
    severity: str
    is_active: bool
    description: Optional[str]

    class Config:
        from_attributes = True

class FraudRuleToggle(BaseModel):
    is_active: bool

# ----------------- Fraud Alert Schemas -----------------
class FraudAlertResponse(BaseModel):
    id: int
    transaction_id: str
    timestamp: datetime
    rule_id: int
    rule_name: str
    amount: float
    severity: str
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True

class FraudAlertUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    transaction_status: Optional[str] = None
# ----------------- Audit Log Schemas -----------------
class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user: str
    action: str
    source_ip: str
    status: str
    details: str

    class Config:
        from_attributes = True

# ----------------- Performance Schemas -----------------
class PerformanceMetrics(BaseModel):
    cpu_usage: float
    memory_usage: float
    active_connections: int
    avg_encryption_time_ms: float
    avg_decryption_time_ms: float
    total_transactions_processed: int
    throughput_tps: float
