from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.entities import User, Article, Vote, Comment


class UserRepository(ABC):
    @abstractmethod
    def create(self, user: User) -> User:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass


class ArticleRepository(ABC):
    @abstractmethod
    def create(self, article: Article) -> Article:
        pass

    @abstractmethod
    def update(self, article: Article) -> Article:
        pass

    @abstractmethod
    def delete(self, article_id: int) -> bool:
        pass

    @abstractmethod
    def get_by_id(self, article_id: int) -> Optional[Article]:
        pass

    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Article]:
        pass

    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 10, tag: Optional[str] = None, search: Optional[str] = None) -> List[Article]:
        pass

    @abstractmethod
    def get_by_author(self, author_id: int) -> List[Article]:
        pass


class VoteRepository(ABC):
    @abstractmethod
    def create(self, vote: Vote) -> Vote:
        pass

    @abstractmethod
    def get_by_user_and_article(self, user_id: int, article_id: int) -> Optional[Vote]:
        pass

    @abstractmethod
    def update(self, vote: Vote) -> Vote:
        pass

    @abstractmethod
    def get_votes_count(self, article_id: int) -> dict:
        pass


class CommentRepository(ABC):
    @abstractmethod
    def create(self, comment: Comment) -> Comment:
        pass

    @abstractmethod
    def get_by_article(self, article_id: int) -> List[Comment]:
        pass