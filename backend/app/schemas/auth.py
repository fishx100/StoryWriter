from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(LoginRequest):
    pass


class AuthenticatedUser(BaseModel):
    id: str | None = None
    supabase_user_id: str
    email: EmailStr | None = None

