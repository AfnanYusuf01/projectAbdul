import bcrypt
from sqlalchemy import Column, Integer, String
from models.database import Base

class DBUser(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'SecurityAdmin', 'FraudAnalyst', 'SystemOperator'

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against its bcrypt hashed counterpart.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """
    Hashes a plain password using Bcrypt.
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
