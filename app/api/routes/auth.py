from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.infrastructure.repositories.user_repository import UserRepositoryImpl
from app.usecases.use_cases.auth_use_cases import RegisterUseCase, LoginUseCase
from app.api.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    register_use_case = RegisterUseCase(user_repo)
    
    try:
        user = register_use_case.execute(request)
        return UserResponse(
            id=user.id,
            email=user.email,
            role=user.role.value,
            created_at=user.created_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    login_use_case = LoginUseCase(user_repo)
    
    try:
        token = login_use_case.execute(request)
        return TokenResponse(access_token=token.access_token, token_type=token.token_type)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))