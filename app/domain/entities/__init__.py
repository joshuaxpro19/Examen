from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from app.domain.enums import UserRole, ArticleStatus, VoteType


@dataclass
class User:
    id: Optional[int] = None
    email: str = ""
    password_hash: str = ""
    role: UserRole = UserRole.READER
    created_at: Optional[datetime] = None


@dataclass
class Article:
    id: Optional[int] = None
    title: str = ""
    slug: str = ""
    content: str = ""
    author_id: int = 0
    status: ArticleStatus = ArticleStatus.DRAFT
    tags: str = ""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class Vote:
    id: Optional[int] = None
    user_id: int = 0
    article_id: int = 0
    vote_type: VoteType = VoteType.UPVOTE


@dataclass
class Comment:
    id: Optional[int] = None
    content: str = ""
    user_id: int = 0
    article_id: int = 0
    created_at: Optional[datetime] = None