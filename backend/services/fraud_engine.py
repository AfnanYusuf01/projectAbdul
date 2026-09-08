from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from models.database import DBFraudRule, DBTransaction, DBFraudAlert

def check_transaction_velocity(db: Session, customer_id: str) -> int:
    """
    Count transactions by this customer in the last 1 minute to check for velocity abuse.
    """
    one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
    return db.query(DBTransaction).filter(
        DBTransaction.customer_id == customer_id,
        DBTransaction.timestamp >= one_minute_ago
    ).count()

def evaluate_transaction(db: Session, transaction_data: dict) -> list:
    """
    Evaluates a transaction dict against all active fraud rules in the database.
    """
    alerts = []
    active_rules = db.query(DBFraudRule).filter(DBFraudRule.is_active == True).all()
    
    amount = transaction_data.get("amount", 0.0)
    customer_id = transaction_data.get("customer_id")
    tx_hour = transaction_data.get("hour", datetime.utcnow().hour)
    
    velocity = check_transaction_velocity(db, customer_id) + 1
    
    for rule in active_rules:
        triggered = False
        
        if rule.parameter == "amount":
            try:
                threshold_val = float(rule.threshold)
                if rule.operator == ">" and amount > threshold_val:
                    triggered = True
                elif rule.operator == "<" and amount < threshold_val:
                    triggered = True
                elif rule.operator == "==" and amount == threshold_val:
                    triggered = True
            except ValueError:
                pass
                
        elif rule.parameter == "velocity":
            try:
                threshold_val = int(rule.threshold)
                if rule.operator == ">" and velocity > threshold_val:
                    triggered = True
                elif rule.operator == "<" and velocity < threshold_val:
                    triggered = True
            except ValueError:
                pass
                
        elif rule.parameter == "hour":
            if rule.operator == "in_range":
                try:
                    parts = rule.threshold.split("-")
                    if len(parts) == 2:
                        start_h = int(parts[0])
                        end_h = int(parts[1])
                        if start_h <= end_h:
                            if start_h <= tx_hour <= end_h:
                                triggered = True
                        else:
                            if tx_hour >= start_h or tx_hour <= end_h:
                                triggered = True
                except Exception:
                    pass
                    
        if triggered:
            alert = DBFraudAlert(
                transaction_id=transaction_data["transaction_id"],
                rule_id=rule.id,
                rule_name=rule.name,
                amount=amount,
                severity=rule.severity,
                status="PENDING",
                notes=f"Kriteria terpicu: {rule.parameter} {rule.operator} {rule.threshold} (Nilai transaksi: {amount if rule.parameter == 'amount' else (velocity if rule.parameter == 'velocity' else tx_hour)})"
            )
            alerts.append(alert)
            
    return alerts
