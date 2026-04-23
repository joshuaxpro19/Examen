from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()


class UserRoleEnum(enum.Enum):
    AUTHOR = "author"
    READER = "reader"


class ArticleStatusEnum(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class VoteTypeEnum(enum.Enum):
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRoleEnum), nullable=False, default=UserRoleEnum.READER)
    created_at = Column(DateTime, default=datetime.utcnow)

    articles = relationship("ArticleModel", back_populates="author")
    votes = relationship("VoteModel", back_populates="user")
    comments = relationship("CommentModel", back_populates="user")


class ArticleModel(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(ArticleStatusEnum), nullable=False, default=ArticleStatusEnum.DRAFT)
    tags = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("UserModel", back_populates="articles")
    votes = relationship("VoteModel", back_populates="article")
    comments = relationship("CommentModel", back_populates="article")


class VoteModel(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    vote_type = Column(SQLEnum(VoteTypeEnum), nullable=False)
    __table_args__ = (
        UniqueConstraint('user_id', 'article_id', name='unique_user_article_vote'),
    )

    user = relationship("UserModel", back_populates="votes")
    article = relationship("ArticleModel", back_populates="votes")


class CommentModel(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserModel", back_populates="comments")
    article = relationship("ArticleModel", back_populates="comments")