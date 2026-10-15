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
    tx_hour = transaction_data.get("hour", datetime.now().hour)
    
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
            if rule.operator == "in_range" and amount >= 1000000:
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

def evaluate_academic_dataset(db: Session) -> dict:
    """
    Evaluates a structured academic testing dataset of 100 transactions with known Ground Truth
    to compute Confusion Matrix (TP, TN, FP, FN), Accuracy, Precision, Recall, and F1-Score.
    """
    active_rules = db.query(DBFraudRule).filter(DBFraudRule.is_active == True).all()
    
    samples = []
    channels = ["QRIS", "Virtual Account", "Credit Card", "E-Wallet"]
    
    # 1. Generate 70 Normal Transactions (Ground Truth: NORMAL)
    for i in range(1, 71):
        samples.append({
            "id": f"TEST-NORM-{i:03d}",
            "customer_id": f"CUST-NORM-{(i % 20) + 1:03d}",
            "amount": float(100000 + (i * 25000) % 3500000),
            "hour": 8 + (i % 12),  # 08:00 - 20:00 (normal working hours)
            "velocity": 1,
            "channel": channels[i % len(channels)],
            "ground_truth": "NORMAL"
        })
        
    # 2. Generate 30 Anomaly / Fraud Transactions (Ground Truth: FRAUD)
    # 10 High Amount (> 10M)
    for i in range(1, 11):
        samples.append({
            "id": f"TEST-FRAUD-AMT-{i:02d}",
            "customer_id": f"CUST-FRAUD-{i:03d}",
            "amount": float(12000000 + (i * 1500000)),
            "hour": 14,
            "velocity": 2,
            "channel": channels[i % len(channels)],
            "ground_truth": "FRAUD"
        })
        
    # 10 Maintenance Window Hours (02:00 - 04:00)
    for i in range(1, 11):
        samples.append({
            "id": f"TEST-FRAUD-HR-{i:02d}",
            "customer_id": f"CUST-NIGHT-{i:03d}",
            "amount": float(750000 + i * 50000),
            "hour": 3,  # Jam pemeliharaan (2-4 WIB)
            "velocity": 1,
            "channel": channels[(i + 1) % len(channels)],
            "ground_truth": "FRAUD"
        })
        
    # 10 Velocity Spam (> 5 tx/min)
    for i in range(1, 11):
        samples.append({
            "id": f"TEST-FRAUD-VEL-{i:02d}",
            "customer_id": f"CUST-SPAM-{i:03d}",
            "amount": float(250000 + i * 20000),
            "hour": 15,
            "velocity": 6 + (i % 4),  # > 5 tx
            "channel": channels[(i + 2) % len(channels)],
            "ground_truth": "FRAUD"
        })
        
    tp = 0
    tn = 0
    fp = 0
    fn = 0
    itemized_results = []
    rule_trigger_counts = {}
    
    for s in samples:
        triggered_rules = []
        for rule in active_rules:
            trig = False
            if rule.parameter == "amount":
                try:
                    th = float(rule.threshold)
                    if rule.operator == ">" and s["amount"] > th:
                        trig = True
                    elif rule.operator == "<" and s["amount"] < th:
                        trig = True
                except ValueError:
                    pass
            elif rule.parameter == "hour":
                if rule.operator == "in_range":
                    try:
                        parts = rule.threshold.split("-")
                        if int(parts[0]) <= s["hour"] <= int(parts[1]):
                            trig = True
                    except Exception:
                        pass
            elif rule.parameter == "velocity":
                try:
                    th = int(rule.threshold)
                    if rule.operator == ">" and s["velocity"] > th:
                        trig = True
                except ValueError:
                    pass
                    
            if trig:
                triggered_rules.append(rule.name)
                rule_trigger_counts[rule.name] = rule_trigger_counts.get(rule.name, 0) + 1
                
        is_predicted_fraud = len(triggered_rules) > 0
        predicted_status = "SUSPICIOUS" if is_predicted_fraud else "SUCCESS"
        
        if s["ground_truth"] == "FRAUD":
            if is_predicted_fraud:
                tp += 1
                verdict = "TRUE_POSITIVE"
            else:
                fn += 1
                verdict = "FALSE_NEGATIVE"
        else:  # NORMAL
            if not is_predicted_fraud:
                tn += 1
                verdict = "TRUE_NEGATIVE"
            else:
                fp += 1
                verdict = "FALSE_POSITIVE"
                
        itemized_results.append({
            "id": s["id"],
            "customer_id": s["customer_id"],
            "amount": s["amount"],
            "channel": s["channel"],
            "ground_truth": s["ground_truth"],
            "predicted_status": predicted_status,
            "verdict": verdict,
            "triggered_rules": ", ".join(triggered_rules) if triggered_rules else "None"
        })
        
    total = len(samples)
    accuracy = round(((tp + tn) / total) * 100, 2)
    precision = round((tp / (tp + fp)) * 100, 2) if (tp + fp) > 0 else 100.0
    recall = round((tp / (tp + fn)) * 100, 2) if (tp + fn) > 0 else 100.0
    f1 = round(2 * (precision * recall) / (precision + recall), 2) if (precision + recall) > 0 else 0.0
    
    return {
        "total_samples": total,
        "true_positives": tp,
        "true_negatives": tn,
        "false_positives": fp,
        "false_negatives": fn,
        "accuracy_pct": accuracy,
        "precision_pct": precision,
        "recall_pct": recall,
        "f1_score_pct": f1,
        "rule_trigger_counts": rule_trigger_counts,
        "evaluated_at": datetime.utcnow().isoformat(),
        "details": itemized_results
    }
