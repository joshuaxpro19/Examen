from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(author|reader)$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: Optional[datetime] = None


class CreateArticleRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    tags: str = ""


class UpdateArticleRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    tags: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(draft|published|archived)$")


class ArticleResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    author_id: int
    status: str
    tags: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    id: int
    title: str
    slug: str
    author_id: int
    status: str
    tags: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CreateCommentRequest(BaseModel):
    content: str = Field(..., min_length=1)


class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    article_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VoteRequest(BaseModel):
    vote_type: str = Field(..., pattern="^(upvote|downvote)$")


class VoteResponse(BaseModel):
    upvotes: int
    downvotes: int
    score: int


class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 10