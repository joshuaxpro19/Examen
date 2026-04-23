from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.infrastructure.repositories.comment_repository import CommentRepositoryImpl
from app.infrastructure.repositories.vote_repository import VoteRepositoryImpl
from app.infrastructure.repositories.article_repository import ArticleRepositoryImpl
from app.usecases.use_cases.interaction_use_cases import CreateCommentUseCase, VoteArticleUseCase
from app.api.schemas import CreateCommentRequest, CommentResponse, VoteRequest, VoteResponse
from app.api.dependencies import get_current_user
from app.domain.entities import User

router = APIRouter(tags=["interactions"])


@router.post("/articles/{slug}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(slug: str, request: CreateCommentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article_repo = ArticleRepositoryImpl(db)
    article = article_repo.get_by_slug(slug)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    if article.status == "archived":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Archived articles do not allow comments")
    
    comment_repo = CommentRepositoryImpl(db)
    comment_use_case = CreateCommentUseCase(comment_repo)
    
    from app.usecases.dto import CreateCommentDTO
    dto = CreateCommentDTO(content=request.content)
    comment = comment_use_case.execute(article.id, current_user.id, dto)
    
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        user_id=comment.user_id,
        article_id=comment.article_id,
        created_at=comment.created_at
    )


@router.get("/articles/{slug}/comments", response_model=list[CommentResponse])
def get_comments(slug: str, db: Session = Depends(get_db)):
    article_repo = ArticleRepositoryImpl(db)
    article = article_repo.get_by_slug(slug)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    
    comment_repo = CommentRepositoryImpl(db)
    comments = comment_repo.get_by_article(article.id)
    
    return [CommentResponse(
        id=c.id,
        content=c.content,
        user_id=c.user_id,
        article_id=c.article_id,
        created_at=c.created_at
    ) for c in comments]


@router.post("/articles/{slug}/vote", response_model=VoteResponse)
def vote_article(slug: str, request: VoteRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article_repo = ArticleRepositoryImpl(db)
    article = article_repo.get_by_slug(slug)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    if article.status == "archived":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Archived articles do not allow votes")
    
    vote_repo = VoteRepositoryImpl(db)
    vote_use_case = VoteArticleUseCase(vote_repo)
    
    from app.usecases.dto import VoteDTO
    dto = VoteDTO(vote_type=request.vote_type)
    
    result = vote_use_case.execute(article.id, current_user.id, dto)
    
    return VoteResponse(**result)


@router.get("/articles/{slug}/vote", response_model=VoteResponse)
def get_votes(slug: str, db: Session = Depends(get_db)):
    article_repo = ArticleRepositoryImpl(db)
    article = article_repo.get_by_slug(slug)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    
    vote_repo = VoteRepositoryImpl(db)
    result = vote_repo.get_votes_count(article.id)
    
    return VoteResponse(**result)