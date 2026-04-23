from app.domain.entities import Comment, Vote
from app.domain.enums import VoteType
from app.domain.repositories import CommentRepository, VoteRepository
from app.usecases.dto import CreateCommentDTO, VoteDTO


class CreateCommentUseCase:
    def __init__(self, comment_repository: CommentRepository):
        self.comment_repository = comment_repository

    def execute(self, article_id: int, user_id: int, dto: CreateCommentDTO) -> Comment:
        comment = Comment(
            content=dto.content,
            user_id=user_id,
            article_id=article_id
        )
        return self.comment_repository.create(comment)


class VoteArticleUseCase:
    def __init__(self, vote_repository: VoteRepository):
        self.vote_repository = vote_repository

    def execute(self, article_id: int, user_id: int, dto: VoteDTO) -> dict:
        existing_vote = self.vote_repository.get_by_user_and_article(user_id, article_id)
        
        if existing_vote:
            if existing_vote.vote_type == VoteType(dto.vote_type):
                return self.vote_repository.get_votes_count(article_id)
            
            existing_vote.vote_type = VoteType(dto.vote_type)
            self.vote_repository.update(existing_vote)
        else:
            vote = Vote(
                user_id=user_id,
                article_id=article_id,
                vote_type=VoteType(dto.vote_type)
            )
            self.vote_repository.create(vote)
        
        return self.vote_repository.get_votes_count(article_id)