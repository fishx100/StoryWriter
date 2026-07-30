from app.core.security import hash_password, verify_password


class AuthService:
    def register_password(self, password: str) -> str:
        return hash_password(password)

    def check_password(self, password: str, password_hash: str) -> bool:
        return verify_password(password, password_hash)
