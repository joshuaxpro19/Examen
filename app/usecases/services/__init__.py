from app.domain.enums import ArticleStatus, UserRole
from app.domain.entities import User


class AuthorizerService:
    @staticmethod
    def can_create_article(user: User) -> bool:
        return user.role == UserRole.AUTHOR

    @staticmethod
    def can_edit_article(user: User, article_author_id: int) -> bool:
        return user.id == article_author_id

    @staticmethod
    def can_delete_article(user: User, article_author_id: int) -> bool:
        return user.id == article_author_id


class ArticleStateService:
    VALID_TRANSITIONS = {
        ArticleStatus.DRAFT: [ArticleStatus.PUBLISHED],
        ArticleStatus.PUBLISHED: [ArticleStatus.ARCHIVED],
        ArticleStatus.ARCHIVED: []
    }

    @staticmethod
    def can_transition(current_status: ArticleStatus, new_status: ArticleStatus) -> bool:
        return new_status in ArticleStateService.VALID_TRANSITIONS.get(current_status, [])