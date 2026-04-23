from typing import Optional, List, Union
from sqlalchemy.orm import Session
from app.domain.entities import User
from app.domain.enums import UserRole
from app.domain.repositories import UserRepository as AbstractUserRepository
from app.infrastructure.models import UserModel, UserRoleEnum
from app.infrastructure.security import get_password_hash
import enum


def map_role_to_enum(role: Union[str, UserRole]) -> UserRoleEnum:
    role_value = role.value if isinstance(role, UserRole) else role
    if str(role_value).lower() == "author":
        return UserRoleEnum.AUTHOR
    return UserRoleEnum.READER


def map_enum_to_role(enum_role: UserRoleEnum) -> UserRole:
    if enum_role == UserRoleEnum.AUTHOR:
        return UserRole.AUTHOR
    return UserRole.READER


class UserRepositoryImpl(AbstractUserRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: User) -> User:
        db_user = UserModel(
            email=user.email,
            password_hash=get_password_hash(user.password_hash),
            role=map_role_to_enum(user.role)
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return User(
            id=db_user.id,
            email=db_user.email,
            role=map_enum_to_role(db_user.role),
            created_at=db_user.created_at
        )

    def get_by_id(self, user_id: int) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            return None
        return User(
            id=db_user.id,
            email=db_user.email,
            role=map_enum_to_role(db_user.role),
            created_at=db_user.created_at
        )

    def get_by_email(self, email: str) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.email == email).first()
        if not db_user:
            return None
        return User(
            id=db_user.id,
            email=db_user.email,
            password_hash=db_user.password_hash,
            role=map_enum_to_role(db_user.role),
            created_at=db_user.created_at
        )