import time
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from services import crypto_helper
from services.metrics import metrics_state
from services.auth_service import get_current_user
from schemas import security_schemas
from models.database import get_db, log_audit

router = APIRouter(prefix="/api/crypto", tags=["Cryptography"], dependencies=[Depends(get_current_user)])

@router.post("/encrypt", response_model=security_schemas.EncryptResponse)
def encrypt_data(req: security_schemas.EncryptRequest, request: Request, db: Session = Depends(get_db)):
    start_time = time.perf_counter()
    try:
        res = crypto_helper.encrypt_payload(req.plaintext)
        duration_ms = (time.perf_counter() - start_time) * 1000.0
        metrics_state["enc_times"].append(duration_ms)
        
        log_audit(db, "SystemOperator", "ENCRYPT_DATA", "Enkripsi payload di playground", "SUCCESS", request.client.host)
        return res
    except Exception as e:
        log_audit(db, "SystemOperator", "ENCRYPT_DATA", f"Gagal enkripsi: {str(e)}", "FAILED", request.client.host)
        raise HTTPException(status_code=500, detail=f"Gagal melakukan enkripsi: {str(e)}")

@router.post("/decrypt", response_model=security_schemas.DecryptResponse)
def decrypt_data(req: security_schemas.DecryptRequest, request: Request, db: Session = Depends(get_db)):
    start_time = time.perf_counter()
    try:
        plaintext = crypto_helper.decrypt_payload(
            req.encrypted_session_key,
            req.ciphertext,
            req.iv,
            req.tag
        )
        duration_ms = (time.perf_counter() - start_time) * 1000.0
        metrics_state["dec_times"].append(duration_ms)
        
        log_audit(db, "SystemOperator", "DECRYPT_DATA", "Dekripsi payload di playground", "SUCCESS", request.client.host)
        return {"plaintext": plaintext}
    except Exception as e:
        log_audit(db, "SystemOperator", "DECRYPT_DATA", f"Gagal dekripsi: {str(e)}", "FAILED", request.client.host)
        raise HTTPException(status_code=400, detail=f"Gagal melakukan dekripsi: {str(e)}")

@router.post("/tamper-test")
def tamper_test(req: security_schemas.EncryptRequest, request: Request, db: Session = Depends(get_db)):
    try:
        res = crypto_helper.simulate_tampering_attack(req.plaintext)
        log_audit(db, "SecurityAdmin", "TAMPER_ATTACK_SIMULATED", f"Uji integritas tampering: status={res['security_status']}", "SUCCESS", request.client.host)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rotate-key")
def rotate_key(request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        res = crypto_helper.rotate_rsa_keys()
        actor = current_user.username if current_user else "SecurityAdmin"
        log_audit(db, actor, "KEY_ROTATION", f"Rotasi kunci RSA-2048 baru: {res['key_fingerprint']}", "SUCCESS", request.client.host)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/benchmark")
def run_benchmark(request: Request, payload_size_kb: int = 1, db: Session = Depends(get_db)):
    try:
        res = crypto_helper.benchmark_cryptography(payload_size_kb)
        log_audit(db, "System", "BENCHMARK_EVALUATION", f"Benchmark ilmiah kriptografi payload {payload_size_kb}KB", "SUCCESS", request.client.host)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
