from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    username: str = Field(..., description="Username pengguna untuk login")
    password: str = Field(..., description="Kata sandi pengguna untuk login")

class LoginResponse(BaseModel):
    access_token: str = Field(..., description="Token akses JWT yang valid")
    token_type: str = Field("bearer", description="Tipe token autentikasi")
    role: str = Field(..., description="Peran otorisasi pengguna (RBAC)")
