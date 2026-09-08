import os
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from models.database import get_db
from models.user import DBUser

# Configuration for JWT signatures
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jatelindo_super_secret_key_9988")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

security_scheme = HTTPBearer()

def create_access_token(data: dict) -> str:
    """
    Generates a signed JWT access token containing the payload dictionary claims
    with an expiration window (default: 60 minutes).
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """
    Decodes and validates a JWT token. Returns the payload claims if valid,
    or None if the signature is invalid or the token is expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme), db: Session = Depends(get_db)) -> DBUser:
    """
    FastAPI dependency to extract and validate the JWT token from the Authorization header.
    Returns the DBUser model of the authenticated user, or raises HTTP 401.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi login tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pengguna tidak ditemukan dalam sistem.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

class RoleChecker:
    """
    FastAPI dependency class to enforce Role-Based Access Control (RBAC).
    Restricts access to specified roles, raising HTTP 403 if unauthorized.
    """
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles
        
    def __call__(self, current_user: DBUser = Depends(get_current_user)) -> DBUser:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses Ditolak: Anda tidak memiliki wewenang untuk melakukan aksi ini."
            )
        return current_user
