from enum import Enum


class UserRole(str, Enum):
    AUTHOR = "author"
    READER = "reader"


class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class VoteType(str, Enum):
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"