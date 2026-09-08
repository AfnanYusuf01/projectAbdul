from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from schemas import auth_schemas
from models.user import DBUser, verify_password
from models.database import get_db, log_audit
from services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=auth_schemas.LoginResponse)
def login(req: auth_schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Authenticates operator credentials against the database.
    Returns a signed JWT access token and active role upon success.
    """
    # 1. Fetch user by username
    user = db.query(DBUser).filter(DBUser.username == req.username).first()
    
    # 2. Check credentials
    if not user or not verify_password(req.password, user.password_hash):
        # Audit fail trail
        log_audit(
            db, 
            req.username, 
            "LOGIN_FAILED", 
            "Gagal login: Kredensial username atau kata sandi salah.", 
            "FAILED", 
            request.client.host
        )
        raise HTTPException(
            status_code=401,
            detail="Kredensial login tidak valid. Pastikan username dan kata sandi benar."
        )
        
    # 3. Successful login - generate access token
    token_payload = {
        "sub": user.username,
        "role": user.role
    }
    token = auth_service.create_access_token(token_payload)
    
    # Audit success trail
    log_audit(
        db, 
        user.username, 
        "LOGIN_SUCCESS", 
        f"Berhasil login. Peran aktif: {user.role}", 
        "SUCCESS", 
        request.client.host
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role
    }
