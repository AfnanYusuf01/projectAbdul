import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database configuration with fallback to SQLite
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "jatelindo_security")

# Attempt MySQL connection, fallback to SQLite
MYSQL_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
SQLITE_URL = "sqlite:///./jatelindo_security.db"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    try:
        temp_engine = create_engine(MYSQL_URL, connect_args={"connect_timeout": 2})
        temp_engine.connect()
        DATABASE_URL = MYSQL_URL
        print("Connected successfully to MySQL database.")
    except Exception:
        DATABASE_URL = SQLITE_URL
        print("MySQL connection unavailable. Falling back to local SQLite database.")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBTransaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(50), unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    customer_id = Column(String(50), index=True)
    amount = Column(Float)
    channel = Column(String(50))
    
    encrypted_payload = Column(Text)
    encrypted_session_key = Column(Text)
    iv = Column(String(50))
    tag = Column(String(50))
    
    status = Column(String(20), default="SUCCESS")

class DBFraudRule(Base):
    __tablename__ = "fraud_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)
    parameter = Column(String(50))
    operator = Column(String(10))
    threshold = Column(String(100))
    severity = Column(String(20))
    is_active = Column(Boolean, default=True)
    description = Column(String(255))

class DBFraudAlert(Base):
    __tablename__ = "fraud_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(50), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    rule_id = Column(Integer)
    rule_name = Column(String(100))
    amount = Column(Float)
    severity = Column(String(20))
    status = Column(String(20), default="PENDING")
    notes = Column(Text, nullable=True)

class DBAuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = Column(String(50))
    action = Column(String(100))
    source_ip = Column(String(50))
    status = Column(String(20))
    details = Column(Text)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    if db.query(DBFraudRule).count() == 0:
        default_rules = [
            DBFraudRule(
                name="Batas Nominal Maksimum",
                parameter="amount",
                operator=">",
                threshold="10000000",
                severity="HIGH",
                is_active=True,
                description="Menandai transaksi tunggal yang nominalnya melebihi Rp 10.000.000."
            ),
            DBFraudRule(
                name="Transaksi Jam Pemeliharaan",
                parameter="hour",
                operator="in_range",
                threshold="2-4",
                severity="MEDIUM",
                is_active=True,
                description="Menandai transaksi bernilai sedang/tinggi yang dilakukan pada jam pemeliharaan (02.00-04.00 WIB)."
            ),
            DBFraudRule(
                name="Velocity Limit (Frekuensi)",
                parameter="velocity",
                operator=">",
                threshold="5",
                severity="HIGH",
                is_active=True,
                description="Mendeteksi serangan spam jika pelanggan melakukan > 5 transaksi dalam kurun waktu 1 menit."
            )
        ]
        db.add_all(default_rules)
        db.commit()

    # Seed default users
    from models.user import DBUser, get_password_hash
    if db.query(DBUser).count() == 0:
        default_users = [
            DBUser(
                username="admin",
                password_hash=get_password_hash("password123"),
                role="SecurityAdmin"
            ),
            DBUser(
                username="analyst",
                password_hash=get_password_hash("password123"),
                role="FraudAnalyst"
            ),
            DBUser(
                username="operator",
                password_hash=get_password_hash("password123"),
                role="SystemOperator"
            )
        ]
        db.add_all(default_users)
        db.commit()

    db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_audit(db, user: str, action: str, details: str, status: str = "SUCCESS", ip: str = "127.0.0.1"):
    audit = DBAuditLog(
        user=user,
        action=action,
        source_ip=ip,
        status=status,
        details=details
    )
    db.add(audit)
    db.commit()


