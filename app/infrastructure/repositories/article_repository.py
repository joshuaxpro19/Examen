from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.entities import Article
from app.domain.enums import ArticleStatus
from app.domain.repositories import ArticleRepository as AbstractArticleRepository
from app.infrastructure.models import ArticleModel, ArticleStatusEnum
from app.usecases.services.slug_service import generate_unique_slug


def map_status_to_enum(status: str) -> ArticleStatusEnum:
    if status == "published":
        return ArticleStatusEnum.PUBLISHED
    elif status == "archived":
        return ArticleStatusEnum.ARCHIVED
    return ArticleStatusEnum.DRAFT


def map_enum_to_status(enum_status: ArticleStatusEnum) -> str:
    if enum_status == ArticleStatusEnum.PUBLISHED:
        return "published"
    elif enum_status == ArticleStatusEnum.ARCHIVED:
        return "archived"
    return "draft"


class ArticleRepositoryImpl(AbstractArticleRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, article: Article) -> Article:
        slug = generate_unique_slug(self.db, article.title)
        db_article = ArticleModel(
            title=article.title,
            slug=slug,
            content=article.content,
            author_id=article.author_id,
            status=map_status_to_enum(article.status.value),
            tags=article.tags
        )
        self.db.add(db_article)
        self.db.commit()
        self.db.refresh(db_article)
        return self._to_entity(db_article)

    def update(self, article: Article) -> Article:
        db_article = self.db.query(ArticleModel).filter(ArticleModel.id == article.id).first()
        if not db_article:
            raise ValueError("Article not found")
        
        if article.title and article.title != db_article.title:
            db_article.title = article.title
            db_article.slug = generate_unique_slug(self.db, article.title, exclude_id=article.id)
        
        if article.content:
            db_article.content = article.content
        if article.status:
            db_article.status = map_status_to_enum(article.status.value)
        if article.tags is not None:
            db_article.tags = article.tags
            
        self.db.commit()
        self.db.refresh(db_article)
        return self._to_entity(db_article)

    def delete(self, article_id: int) -> bool:
        db_article = self.db.query(ArticleModel).filter(ArticleModel.id == article_id).first()
        if not db_article:
            return False
        self.db.delete(db_article)
        self.db.commit()
        return True

    def get_by_id(self, article_id: int) -> Optional[Article]:
        db_article = self.db.query(ArticleModel).filter(ArticleModel.id == article_id).first()
        if not db_article:
            return None
        return self._to_entity(db_article)

    def get_by_slug(self, slug: str) -> Optional[Article]:
        db_article = self.db.query(ArticleModel).filter(ArticleModel.slug == slug).first()
        if not db_article:
            return None
        return self._to_entity(db_article)

    def get_all(self, skip: int = 0, limit: int = 10, tag: Optional[str] = None, search: Optional[str] = None) -> List[Article]:
        query = self.db.query(ArticleModel).filter(ArticleModel.status == ArticleStatusEnum.PUBLISHED)
        
        if tag:
            query = query.filter(ArticleModel.tags.contains(tag))
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (ArticleModel.title.like(search_term)) | 
                (ArticleModel.content.like(search_term))
            )
        
        db_articles = query.order_by(ArticleModel.created_at.desc()).offset(skip).limit(limit).all()
        return [self._to_entity(a) for a in db_articles]

    def get_by_author(self, author_id: int) -> List[Article]:
        db_articles = self.db.query(ArticleModel).filter(ArticleModel.author_id == author_id).all()
        return [self._to_entity(a) for a in db_articles]

    def _to_entity(self, db_article: ArticleModel) -> Article:
        return Article(
            id=db_article.id,
            title=db_article.title,
            slug=db_article.slug,
            content=db_article.content,
            author_id=db_article.author_id,
            status=map_enum_to_status(db_article.status),
            tags=db_article.tags,
            created_at=db_article.created_at,
            updated_at=db_article.updated_at
        )