from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List

from schemas import security_schemas
from models.database import get_db, log_audit, DBFraudRule, DBFraudAlert
from services.auth_service import get_current_user, RoleChecker

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

@router.put("/alerts/{id}", response_model=security_schemas.FraudAlertResponse, dependencies=[Depends(RoleChecker(["FraudAnalyst"]))])
def update_alert(id: int, req: security_schemas.FraudAlertUpdate, request: Request, db: Session = Depends(get_db)):
    alert = db.query(DBFraudAlert).filter(DBFraudAlert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert tidak ditemukan")
        
    alert.status = req.status
    if req.notes:
        alert.notes = req.notes
    db.commit()
    db.refresh(alert)
    log_audit(db, "FraudAnalyst", "UPDATE_ALERT", f"Mengubah status alert ID {id} menjadi {req.status}", "SUCCESS", request.client.host)
    return alert
