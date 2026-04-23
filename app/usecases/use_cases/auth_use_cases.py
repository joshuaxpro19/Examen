from datetime import timedelta
from typing import Optional
from app.domain.entities import User
from app.domain.enums import UserRole
from app.domain.repositories import UserRepository
from app.infrastructure.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.usecases.dto import RegisterDTO, LoginDTO, TokenDTO


class RegisterUseCase:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def execute(self, dto: RegisterDTO) -> User:
        existing = self.user_repository.get_by_email(dto.email)
        if existing:
            raise ValueError("Email already registered")
        
        user = User(
            email=dto.email,
            password_hash=dto.password,
            role=UserRole(dto.role)
        )
        return self.user_repository.create(user)


class LoginUseCase:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def execute(self, dto: LoginDTO) -> TokenDTO:
        user = self.user_repository.get_by_email(dto.email)
        if not user or not verify_password(dto.password, user.password_hash):
            raise ValueError("Invalid email or password")
        
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value if hasattr(user.role, 'value') else user.role},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return TokenDTO(access_token=access_token, token_type="bearer")