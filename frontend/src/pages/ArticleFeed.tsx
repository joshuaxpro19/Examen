import { useState, useEffect } from 'react';
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

export function ArticleFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const { isAuthenticated, user } = useAuth();

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

  const uniqueTags = [...new Set(articles.flatMap((a) => a.tags.split(',').map((t) => t.trim()).filter(Boolean)))];

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
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="">Todos los tags</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        {isAuthenticated && user?.role === 'author' && (
          <Link to="/articles/new" className="btn-primary">
            Nuevo Artículo
          </Link>
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
              <span className="status">{article.status}</span>
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