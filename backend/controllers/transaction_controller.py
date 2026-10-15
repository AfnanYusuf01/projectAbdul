import time
import random
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from services import crypto_helper, fraud_engine
from services.metrics import metrics_state
from services.auth_service import get_current_user, RoleChecker
from schemas import security_schemas
from models.database import get_db, log_audit, DBTransaction, DBFraudAlert, SessionLocal

router = APIRouter(prefix="/api/transactions", tags=["Transactions"], dependencies=[Depends(get_current_user)])

@router.post("", response_model=security_schemas.TransactionResponse)
def create_transaction(req: security_schemas.TransactionCreate, request: Request, db: Session = Depends(get_db)):
    rec_name = req.recipient_name
    rec_acc = req.recipient_account
    
    if not rec_name or not rec_acc:
        try:
            import json
            parsed = json.loads(req.payload)
            if isinstance(parsed, dict):
                rec_name = rec_name or parsed.get("recipient_name")
                rec_acc = rec_acc or parsed.get("recipient_account")
        except Exception:
            pass
            
    if not rec_name:
        rec_name = "Luciana Chen" if "QRIS" not in req.channel else "Luciana Chen (QRIS)"
    if not rec_acc:
        rec_acc = "522039182300" if "QRIS" not in req.channel else "QRIS-ID-99281"

    start_time = time.perf_counter()
    try:
        crypto_res = crypto_helper.encrypt_payload(req.payload)
        enc_duration = (time.perf_counter() - start_time) * 1000.0
        metrics_state["enc_times"].append(enc_duration)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enkripsi hybrid gagal: {str(e)}")

    tx_id = f"JAT-{int(time.time())}-{random.randint(1000, 9999)}"
    
    tx_eval_data = {
        "transaction_id": tx_id,
        "customer_id": req.customer_id,
        "amount": req.amount,
        "hour": datetime.now().hour
    }
    
    alerts = fraud_engine.evaluate_transaction(db, tx_eval_data)
    is_suspicious = len(alerts) > 0
    status = "SUSPICIOUS" if is_suspicious else "SUCCESS"
    
    db_tx = DBTransaction(
        transaction_id=tx_id,
        customer_id=req.customer_id,
        amount=req.amount,
        channel=req.channel,
        recipient_name=rec_name,
        recipient_account=rec_acc,
        encrypted_payload=crypto_res["ciphertext"],
        encrypted_session_key=crypto_res["encrypted_session_key"],
        iv=crypto_res["iv"],
        tag=crypto_res["tag"],
        status=status
    )
    
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    
    if is_suspicious:
        for alert in alerts:
            db.add(alert)
        db.commit()
        log_audit(db, "System", "FRAUD_DETECTED", f"Fraud terdeteksi pada transaksi {tx_id}", "SUCCESS", request.client.host)
    
    metrics_state["total_tx"] += 1
    log_audit(db, "API_Client", "CREATE_TRANSACTION", f"Membuat transaksi {tx_id} via API", "SUCCESS", request.client.host)
    
    return db_tx

@router.get("", response_model=List[security_schemas.TransactionResponse])
def get_transactions(db: Session = Depends(get_db), limit: int = 2000, offset: int = 0):
    return db.query(DBTransaction).order_by(DBTransaction.timestamp.desc()).offset(offset).limit(limit).all()

@router.post("/{id}/decrypt", response_model=security_schemas.DecryptResponse, dependencies=[Depends(RoleChecker(["FraudAnalyst", "SecurityAdmin"]))])
def decrypt_transaction_payload(id: int, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.query(DBTransaction).filter(DBTransaction.id == id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
        
    start_time = time.perf_counter()
    try:
        plaintext = crypto_helper.decrypt_payload(
            tx.encrypted_session_key,
            tx.encrypted_payload,
            tx.iv,
            tx.tag
        )
        duration_ms = (time.perf_counter() - start_time) * 1000.0
        metrics_state["dec_times"].append(duration_ms)
        
        actor = current_user.username if current_user else "SecurityAdmin"
        log_audit(
            db, 
            actor, 
            "DECRYPT_TRANSACTION", 
            f"Mendekripsi data transaksi {tx.transaction_id} (ID: {tx.id})", 
            "SUCCESS", 
            request.client.host
        )
        return {"plaintext": plaintext}
    except Exception as e:
        log_audit(
            db, 
            "FraudAnalyst", 
            "DECRYPT_TRANSACTION", 
            f"Gagal mendekripsi transaksi {tx.transaction_id}: {str(e)}", 
            "FAILED", 
            request.client.host
        )
        raise HTTPException(status_code=400, detail=f"Gagal mendekripsi data transaksi: {str(e)}")

@router.post("/simulate")
def simulate_transactions(background_tasks: BackgroundTasks, count: int = 1):
    """
    Simulates a burst of transactions for test purposes.
    """
    channels = ["QRIS", "Virtual Account", "E-Wallet", "Credit Card"]
    customers = [f"CUST-{random.randint(100, 999)}" for _ in range(5)]
    
    def run_simulation():
        sim_db = SessionLocal()
        try:
            for _ in range(count):
                cust = random.choice(customers)
                if random.random() < 0.15:
                    amount = random.uniform(12000000.0, 25000000.0)
                else:
                    amount = random.uniform(10000.0, 500000.0)
                channel = random.choice(channels)
                
                sim_recipients = [
                    {"name": "Luciana Chen", "account": "522039182300"},
                    {"name": "Caturnusa", "account": "021001092834"},
                    {"name": "Budi Santoso", "account": "880813889900"},
                    {"name": "Afnan Yusuf", "account": "1800015394804"},
                    {"name": "Siti Rahmawati", "account": "524091823006"},
                    {"name": "Dewi Anggraini Putri", "account": "088912340008"},
                    {"name": "Kopi Kenangan (QRIS)", "account": "QRIS-ID-88392"},
                    {"name": "Indomaret Point (QRIS)", "account": "QRIS-ID-55102"},
                    {"name": "Luciana Chen (BCA VA)", "account": "8001081987654321"},
                    {"name": "PLN Pascabayar (VA)", "account": "88019283741009"},
                ]
                
                if "QRIS" in channel.upper():
                    rec = random.choice([r for r in sim_recipients if "QRIS" in r["name"]])
                elif "VIRTUAL ACCOUNT" in channel.upper() or "VA" in channel.upper():
                    rec = random.choice([r for r in sim_recipients if "VA" in r["name"]])
                else:
                    rec = random.choice([r for r in sim_recipients if "QRIS" not in r["name"] and "VA" not in r["name"]])
                
                import json
                payload = json.dumps({
                    "customer_id": cust,
                    "recipient_name": rec["name"],
                    "recipient_account": rec["account"],
                    "amount": round(amount, 2),
                    "channel": channel,
                    "card_hash": uuid.uuid4().hex
                })
                
                crypto_res = crypto_helper.encrypt_payload(payload)
                tx_id = f"JAT-SIM-{int(time.time())}-{random.randint(1000, 9999)}"
                
                tx_eval_data = {
                    "transaction_id": tx_id,
                    "customer_id": cust,
                    "amount": amount,
                    "hour": datetime.now().hour
                }
                alerts = fraud_engine.evaluate_transaction(sim_db, tx_eval_data)
                is_suspicious = len(alerts) > 0
                status = "SUSPICIOUS" if is_suspicious else "SUCCESS"
                
                db_tx = DBTransaction(
                    transaction_id=tx_id,
                    customer_id=cust,
                    amount=amount,
                    channel=channel,
                    recipient_name=rec["name"],
                    recipient_account=rec["account"],
                    encrypted_payload=crypto_res["ciphertext"],
                    encrypted_session_key=crypto_res["encrypted_session_key"],
                    iv=crypto_res["iv"],
                    tag=crypto_res["tag"],
                    status=status
                )
                sim_db.add(db_tx)
                sim_db.commit()
                if is_suspicious:
                    for alert in alerts:
                        sim_db.add(alert)
                    sim_db.commit()
                
                metrics_state["total_tx"] += 1
                time.sleep(0.1)
        finally:
            sim_db.close()
            
    background_tasks.add_task(run_simulation)
    return {"status": "simulation_started", "count": count}
