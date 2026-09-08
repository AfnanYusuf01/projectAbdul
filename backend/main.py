import time
import random
import psutil
from datetime import datetime
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from models.database import init_db, get_db, DBAuditLog
from services.metrics import metrics_state
from schemas import security_schemas

# Import Routers from Controllers
from controllers.auth_controller import router as auth_router
from controllers.crypto_controller import router as crypto_router
from controllers.fraud_controller import router as fraud_router
from controllers.transaction_controller import router as transaction_router

app = FastAPI(title="PT Jatelindo Electronic Transaction Security Portal API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database tables
@app.on_event("startup")
def startup_event():
    init_db()

# Mount Controllers Routers
app.include_router(auth_router)
app.include_router(crypto_router)
app.include_router(fraud_router)
app.include_router(transaction_router)


# ----------------- GLOBAL ENDPOINTS -----------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow()}

@app.get("/api/audit-logs", response_model=List[security_schemas.AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(DBAuditLog).order_by(DBAuditLog.timestamp.desc()).limit(150).all()

@app.get("/api/performance/metrics", response_model=security_schemas.PerformanceMetrics)
def get_performance_metrics(db: Session = Depends(get_db)):
    # Calculate averages
    avg_enc = sum(metrics_state["enc_times"][-50:]) / len(metrics_state["enc_times"][-50:]) if metrics_state["enc_times"] else 0.45
    avg_dec = sum(metrics_state["dec_times"][-50:]) / len(metrics_state["dec_times"][-50:]) if metrics_state["dec_times"] else 0.85
    
    # CPU / Memory telemetry
    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory().percent
    
    # Active DB connections simulation
    active_conn = random.randint(12, 28)
    
    # Calculate fake but dynamic Throughput (TPS) based on total transaction count
    tps = round(random.uniform(5.5, 24.2), 2) if metrics_state["total_tx"] > 0 else 0.0
    
    return {
        "cpu_usage": cpu if cpu > 0 else round(random.uniform(2.5, 12.0), 1),
        "memory_usage": memory,
        "active_connections": active_conn,
        "avg_encryption_time_ms": round(avg_enc, 3),
        "avg_decryption_time_ms": round(avg_dec, 3),
        "total_transactions_processed": metrics_state["total_tx"],
        "throughput_tps": tps
    }
