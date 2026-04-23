import re
from sqlalchemy.orm import Session
from app.infrastructure.models import ArticleModel


def generate_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug


def generate_unique_slug(db: Session, title: str, exclude_id: int = None) -> str:
    base_slug = generate_slug(title)
    slug = base_slug
    counter = 1
    
    while True:
        query = db.query(ArticleModel).filter(ArticleModel.slug == slug)
        if exclude_id:
            query = query.filter(ArticleModel.id != exclude_id)
        
        existing = query.first()
        if not existing:
            break
        
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug