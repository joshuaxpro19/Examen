from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.entities import Vote
from app.domain.enums import VoteType
from app.domain.repositories import VoteRepository as AbstractVoteRepository
from app.infrastructure.models import VoteModel, VoteTypeEnum


def map_vote_type_to_enum(vote_type: str) -> VoteTypeEnum:
    if vote_type == "upvote":
        return VoteTypeEnum.UPVOTE
    return VoteTypeEnum.DOWNVOTE


def map_vote_enum_to_type(enum_vote: VoteTypeEnum) -> str:
    if enum_vote == VoteTypeEnum.UPVOTE:
        return "upvote"
    return "downvote"


class VoteRepositoryImpl(AbstractVoteRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, vote: Vote) -> Vote:
        db_vote = VoteModel(
            user_id=vote.user_id,
            article_id=vote.article_id,
            vote_type=map_vote_type_to_enum(vote.vote_type.value)
        )
        self.db.add(db_vote)
        self.db.commit()
        self.db.refresh(db_vote)
        return self._to_entity(db_vote)

    def get_by_user_and_article(self, user_id: int, article_id: int) -> Optional[Vote]:
        db_vote = self.db.query(VoteModel).filter(
            VoteModel.user_id == user_id,
            VoteModel.article_id == article_id
        ).first()
        if not db_vote:
            return None
        return self._to_entity(db_vote)

    def update(self, vote: Vote) -> Vote:
        db_vote = self.db.query(VoteModel).filter(VoteModel.id == vote.id).first()
        if not db_vote:
            raise ValueError("Vote not found")
        db_vote.vote_type = map_vote_type_to_enum(vote.vote_type.value)
        self.db.commit()
        self.db.refresh(db_vote)
        return self._to_entity(db_vote)

    def get_votes_count(self, article_id: int) -> dict:
        votes = self.db.query(VoteModel).filter(VoteModel.article_id == article_id).all()
        upvotes = sum(1 for v in votes if v.vote_type == VoteTypeEnum.UPVOTE)
        downvotes = sum(1 for v in votes if v.vote_type == VoteTypeEnum.DOWNVOTE)
        return {"upvotes": upvotes, "downvotes": downvotes, "score": upvotes - downvotes}

    def _to_entity(self, db_vote: VoteModel) -> Vote:
        return Vote(
            id=db_vote.id,
            user_id=db_vote.user_id,
            article_id=db_vote.article_id,
            vote_type=map_vote_enum_to_type(db_vote.vote_type)
        )