from typing import List, Optional
from app.domain.entities import Article, User
from app.domain.enums import ArticleStatus
from app.domain.repositories import ArticleRepository
from app.usecases.dto import CreateArticleDTO, UpdateArticleDTO
from app.usecases.services import AuthorizerService, ArticleStateService


class CreateArticleUseCase:
    def __init__(self, article_repository: ArticleRepository):
        self.article_repository = article_repository

    def execute(self, dto: CreateArticleDTO, author: User) -> Article:
        if not AuthorizerService.can_create_article(author):
            raise PermissionError("Only authors can create articles")
        
        article = Article(
            title=dto.title,
            content=dto.content,
            tags=dto.tags,
            author_id=author.id,
            status=ArticleStatus.DRAFT
        )
        return self.article_repository.create(article)


class UpdateArticleUseCase:
    def __init__(self, article_repository: ArticleRepository):
        self.article_repository = article_repository

    def execute(self, slug: str, dto: UpdateArticleDTO, user: User) -> Article:
        article = self.article_repository.get_by_slug(slug)
        if not article:
            raise ValueError("Article not found")
        
        if not AuthorizerService.can_edit_article(user, article.author_id):
            raise PermissionError("You can only edit your own articles")
        
        if dto.status:
            current_status = article.status
            new_status = ArticleStatus(dto.status)
            if not ArticleStateService.can_transition(current_status, new_status):
                raise ValueError(f"Invalid status transition from {current_status.value} to {new_status.value}")
        
        updated_article = Article(
            id=article.id,
            title=dto.title if dto.title else article.title,
            content=dto.content if dto.content else article.content,
            tags=dto.tags if dto.tags is not None else article.tags,
            status=ArticleStatus(dto.status) if dto.status else article.status
        )
        return self.article_repository.update(updated_article)


class DeleteArticleUseCase:
    def __init__(self, article_repository: ArticleRepository):
        self.article_repository = article_repository

    def execute(self, slug: str, user: User) -> bool:
        article = self.article_repository.get_by_slug(slug)
        if not article:
            raise ValueError("Article not found")
        
        if not AuthorizerService.can_delete_article(user, article.author_id):
            raise PermissionError("You can only delete your own articles")
        
        return self.article_repository.delete(article.id)


class GetArticleUseCase:
    def __init__(self, article_repository: ArticleRepository):
        self.article_repository = article_repository

    def execute(self, slug: str) -> Article:
        article = self.article_repository.get_by_slug(slug)
        if not article:
            raise ValueError("Article not found")
        return article


class ListArticlesUseCase:
    def __init__(self, article_repository: ArticleRepository):
        self.article_repository = article_repository

    def execute(self, skip: int = 0, limit: int = 10, tag: Optional[str] = None, search: Optional[str] = None) -> List[Article]:
        return self.article_repository.get_all(skip=skip, limit=limit, tag=tag, search=search)


class GetAuthorArticlesUseCase:
    def __init__(self, article_repository: ArticleRepository):
        self.article_repository = article_repository

    def execute(self, author_id: int) -> List[Article]:
        return self.article_repository.get_by_author(author_id)