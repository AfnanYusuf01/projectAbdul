from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List

from schemas import security_schemas
from models.database import get_db, log_audit, DBFraudRule, DBFraudAlert, DBTransaction
from services.auth_service import get_current_user, RoleChecker
from services import fraud_engine

router = APIRouter(prefix="/api", tags=["Fraud Detection & Alerts"], dependencies=[Depends(get_current_user)])

# 1. Rules
@router.get("/rules", response_model=List[security_schemas.FraudRuleResponse])
def get_rules(db: Session = Depends(get_db)):
    return db.query(DBFraudRule).all()

@router.post("/rules", response_model=security_schemas.FraudRuleResponse, dependencies=[Depends(RoleChecker(["SecurityAdmin"]))])
def create_rule(req: security_schemas.FraudRuleCreate, request: Request, db: Session = Depends(get_db)):
    db_rule = DBFraudRule(**req.dict())
    db.add(db_rule)
    try:
        db.commit()
        db.refresh(db_rule)
        log_audit(db, "SecurityAdmin", "CREATE_RULE", f"Membuat aturan baru: {req.name}", "SUCCESS", request.client.host)
        return db_rule
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Gagal membuat rule: {str(e)}")

@router.put("/rules/{id}/toggle", response_model=security_schemas.FraudRuleResponse, dependencies=[Depends(RoleChecker(["SecurityAdmin"]))])
def toggle_rule(id: int, req: security_schemas.FraudRuleToggle, request: Request, db: Session = Depends(get_db)):
    rule = db.query(DBFraudRule).filter(DBFraudRule.id == id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Aturan tidak ditemukan")
    
    rule.is_active = req.is_active
    db.commit()
    db.refresh(rule)
    status_str = "AKTIF" if req.is_active else "NON-AKTIF"
    log_audit(db, "SecurityAdmin", "TOGGLE_RULE", f"Mengubah aturan '{rule.name}' menjadi {status_str}", "SUCCESS", request.client.host)
    return rule

# 2. Alerts
@router.get("/alerts", response_model=List[security_schemas.FraudAlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(DBFraudAlert).order_by(DBFraudAlert.timestamp.desc()).all()

@router.put("/alerts/{id}", response_model=security_schemas.FraudAlertResponse, dependencies=[Depends(RoleChecker(["FraudAnalyst", "SecurityAdmin"]))])
def update_alert(id: int, req: security_schemas.FraudAlertUpdate, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(DBFraudAlert).filter(DBFraudAlert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert tidak ditemukan")
        
    alert.status = req.status
    if req.notes:
        alert.notes = req.notes

    # If decision sets transaction status (e.g. FAILED or SUCCESS)
    if req.transaction_status:
        tx = db.query(DBTransaction).filter(DBTransaction.transaction_id == alert.transaction_id).first()
        if tx:
            tx.status = req.transaction_status
            
    db.commit()
    db.refresh(alert)
    
    actor = current_user.username if current_user else "SecurityAdmin"
    log_audit(db, actor, "DECIDE_FRAUD_ALERT", f"Keputusan tiket fraud #{alert.transaction_id}: Alert={req.status}, TxStatus={req.transaction_status or 'UNCHANGED'}", "SUCCESS", request.client.host)
    return alert

@router.post("/fraud/evaluate-dataset")
def run_dataset_evaluation(request: Request, db: Session = Depends(get_db)):
    try:
        res = fraud_engine.evaluate_academic_dataset(db)
        log_audit(db, "System", "FRAUD_DATASET_EVALUATION", f"Evaluasi 100 sampel dataset skripsi: Akurasi={res['accuracy_pct']}%, F1={res['f1_score_pct']}%", "SUCCESS", request.client.host)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
