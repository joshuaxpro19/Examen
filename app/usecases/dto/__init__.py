from dataclasses import dataclass
from typing import Optional


@dataclass
class RegisterDTO:
    email: str
    password: str
    role: str


@dataclass
class LoginDTO:
    email: str
    password: str


@dataclass
class TokenDTO:
    access_token: str
    token_type: str


@dataclass
class CreateArticleDTO:
    title: str
    content: str
    tags: str = ""


@dataclass
class UpdateArticleDTO:
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None


@dataclass
class CreateCommentDTO:
    content: str


@dataclass
class VoteDTO:
    vote_type: str