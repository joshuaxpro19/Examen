from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.entities import Comment
from app.domain.repositories import CommentRepository as AbstractCommentRepository
from app.infrastructure.models import CommentModel


class CommentRepositoryImpl(AbstractCommentRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, comment: Comment) -> Comment:
        db_comment = CommentModel(
            content=comment.content,
            user_id=comment.user_id,
            article_id=comment.article_id
        )
        self.db.add(db_comment)
        self.db.commit()
        self.db.refresh(db_comment)
        return self._to_entity(db_comment)

    def get_by_article(self, article_id: int) -> List[Comment]:
        db_comments = self.db.query(CommentModel).filter(
            CommentModel.article_id == article_id
        ).order_by(CommentModel.created_at.desc()).all()
        return [self._to_entity(c) for c in db_comments]

    def _to_entity(self, db_comment: CommentModel) -> Comment:
        return Comment(
            id=db_comment.id,
            content=db_comment.content,
            user_id=db_comment.user_id,
            article_id=db_comment.article_id,
            created_at=db_comment.created_at
        )