import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Article {
  id: number;
  title: string;
  slug: string;
  author_id: number;
  status: string;
  tags: string;
  created_at: string;
}

interface ArticleFeedProps {
  onNewArticle?: () => void;
}

export function ArticleFeed({ onNewArticle }: ArticleFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [isTagComboOpen, setIsTagComboOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const comboRef = useRef<HTMLDivElement | null>(null);
  const getStatusLabel = (status: string) => {
    if (status === 'draft') return 'Borrador';
    if (status === 'published') return 'Publicado';
    if (status === 'archived') return 'Archivado';
    return status;
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getArticles({
        search: search || undefined,
        tag: tagFilter || undefined,
      });
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [search, tagFilter]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!comboRef.current) return;
      if (!comboRef.current.contains(event.target as Node)) {
        setIsTagComboOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const uniqueTags = [...new Set(articles.flatMap((a) => a.tags.split(',').map((t) => t.trim()).filter(Boolean)))];
  const comboLabel = tagFilter || 'Todos los tags';

  return (
    <div className="article-feed">
      <h1>Blog Técnico</h1>

      <div className="feed-controls">
        <input
          type="text"
          placeholder="Buscar artículos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="tag-combobox" ref={comboRef}>
          <button
            type="button"
            className="tag-combobox-trigger"
            onClick={() => setIsTagComboOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isTagComboOpen}
          >
            <span>{comboLabel}</span>
            <span className="combo-arrow" aria-hidden="true">▾</span>
          </button>
          {isTagComboOpen && (
            <div className="tag-combobox-menu" role="listbox">
              <button
                type="button"
                className={`tag-combo-option ${tagFilter === '' ? 'active' : ''}`}
                onClick={() => {
                  setTagFilter('');
                  setIsTagComboOpen(false);
                }}
              >
                Todos los tags
              </button>
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-combo-option ${tagFilter === tag ? 'active' : ''}`}
                  onClick={() => {
                    setTagFilter(tag);
                    setIsTagComboOpen(false);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        {isAuthenticated && user?.role === 'author' && (
          <button className="btn-primary" onClick={onNewArticle}>
            Nuevo Artículo
          </button>
        )}
      </div>

      {loading && <div className="loading">Cargando artículos...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && articles.length === 0 && (
        <div className="empty">No hay artículos publicados</div>
      )}

      <div className="articles-list">
        {articles.map((article) => (
          <article key={article.id} className="article-card">
            <h3>
              <Link to={`/articles/${article.slug}`}>{article.title}</Link>
            </h3>
            <div className="article-meta">
              <span className={`status status-${article.status}`}>{getStatusLabel(article.status)}</span>
              {article.tags && <span className="tags">{article.tags}</span>}
            </div>
            <Link to={`/articles/${article.slug}`} className="read-more">
              Leer más
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}