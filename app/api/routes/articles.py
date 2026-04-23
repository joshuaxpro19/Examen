from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.infrastructure.database import get_db
from app.infrastructure.repositories.article_repository import ArticleRepositoryImpl
from app.usecases.use_cases.article_use_cases import (
    CreateArticleUseCase, UpdateArticleUseCase, DeleteArticleUseCase,
    GetArticleUseCase, ListArticlesUseCase, GetAuthorArticlesUseCase
)
from app.api.schemas import (
    CreateArticleRequest, UpdateArticleRequest, ArticleResponse, ArticleListResponse
)
from app.api.dependencies import get_current_user
from app.domain.entities import User

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("", response_model=list[ArticleListResponse])
def list_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    article_repo = ArticleRepositoryImpl(db)
    list_use_case = ListArticlesUseCase(article_repo)
    articles = list_use_case.execute(skip=skip, limit=limit, tag=tag, search=search)
    return [ArticleListResponse(
        id=a.id,
        title=a.title,
        slug=a.slug,
        author_id=a.author_id,
        status=a.status,
        tags=a.tags,
        created_at=a.created_at
    ) for a in articles]


@router.get("/my-articles", response_model=list[ArticleListResponse])
def get_my_articles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "author":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only authors can view their articles")
    article_repo = ArticleRepositoryImpl(db)
    use_case = GetAuthorArticlesUseCase(article_repo)
    articles = use_case.execute(current_user.id)
    return [ArticleListResponse(
        id=a.id,
        title=a.title,
        slug=a.slug,
        author_id=a.author_id,
        status=a.status,
        tags=a.tags,
        created_at=a.created_at
    ) for a in articles]


@router.get("/{slug}", response_model=ArticleResponse)
def get_article(slug: str, db: Session = Depends(get_db)):
    article_repo = ArticleRepositoryImpl(db)
    get_use_case = GetArticleUseCase(article_repo)
    
    try:
        article = get_use_case.execute(slug)
        return ArticleResponse(
            id=article.id,
            title=article.title,
            slug=article.slug,
            content=article.content,
            author_id=article.author_id,
            status=article.status,
            tags=article.tags,
            created_at=article.created_at,
            updated_at=article.updated_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(request: CreateArticleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "author":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only authors can create articles")
    
    article_repo = ArticleRepositoryImpl(db)
    create_use_case = CreateArticleUseCase(article_repo)
    
    try:
        article = create_use_case.execute(request, current_user)
        return ArticleResponse(
            id=article.id,
            title=article.title,
            slug=article.slug,
            content=article.content,
            author_id=article.author_id,
            status=article.status,
            tags=article.tags,
            created_at=article.created_at,
            updated_at=article.updated_at
        )
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/{slug}", response_model=ArticleResponse)
def update_article(slug: str, request: UpdateArticleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article_repo = ArticleRepositoryImpl(db)
    update_use_case = UpdateArticleUseCase(article_repo)
    
    try:
        article = update_use_case.execute(slug, request, current_user)
        return ArticleResponse(
            id=article.id,
            title=article.title,
            slug=article.slug,
            content=article.content,
            author_id=article.author_id,
            status=article.status,
            tags=article.tags,
            created_at=article.created_at,
            updated_at=article.updated_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article_repo = ArticleRepositoryImpl(db)
    delete_use_case = DeleteArticleUseCase(article_repo)
    
    try:
        delete_use_case.execute(slug, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))