import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Article {
  id: number;
  title: string;
  slug: string;
  status: string;
  tags: string;
}

export function AuthorPanel() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user, isAuthenticated } = useAuth();

  const fetchArticles = async () => {
    if (!isAuthenticated || !token || user?.role !== 'author') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await api.getMyArticles(token);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [token, user, isAuthenticated]);

  const handleStatusChange = async (slug: string, newStatus: string) => {
    if (!token) return;
    try {
      await api.updateArticle(slug, { status: newStatus }, token);
      setArticles(articles.map((a) => (a.slug === slug ? { ...a, status: newStatus } : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  if (!isAuthenticated) {
    return <div className="error">Debes iniciar sesión</div>;
  }

  if (user?.role !== 'author') {
    return <div className="error">Solo autores pueden ver este panel. Tu rol actual: {user?.role}</div>;
  }

  const drafts = articles.filter((a) => a.status === 'draft');
  const published = articles.filter((a) => a.status === 'published');
  const archived = articles.filter((a) => a.status === 'archived');

  return (
    <div className="author-panel">
      <h1>Mi Panel de Autor</h1>
      <p>Usuario: {user?.email} | Rol: {user?.role}</p>

      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && (
        <>
          {drafts.length > 0 && (
            <section className="article-section">
              <h2>Borradores ({drafts.length})</h2>
              <div className="articles-list">
                {drafts.map((article) => (
                  <div key={article.id} className="article-card author-article-card">
                    <div className="author-card-head">
                      <h3>{article.title}</h3>
                      <div className="author-card-actions">
                        <Link className="action-btn" to={`/articles/${article.slug}/edit`}>Editar</Link>
                        <button className="action-btn publish" onClick={() => handleStatusChange(article.slug, 'published')}>
                          Publicar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {published.length > 0 && (
            <section className="article-section">
              <h2>Publicados ({published.length})</h2>
              <div className="articles-list">
                {published.map((article) => (
                  <div key={article.id} className="article-card author-article-card">
                    <div className="author-card-head">
                      <h3>{article.title}</h3>
                      <div className="author-card-actions">
                        <Link className="action-btn" to={`/articles/${article.slug}`}>Ver</Link>
                        <Link className="action-btn" to={`/articles/${article.slug}/edit`}>Editar</Link>
                        <button className="action-btn archive" onClick={() => handleStatusChange(article.slug, 'archived')}>
                          Archivar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {archived.length > 0 && (
            <section className="article-section">
              <h2>Archivados ({archived.length})</h2>
              <div className="articles-list">
                {archived.map((article) => (
                  <div key={article.id} className="article-card author-article-card">
                    <div className="author-card-head">
                      <h3>{article.title}</h3>
                      <div className="author-card-actions">
                        <Link className="action-btn" to={`/articles/${article.slug}`}>Ver</Link>
                      </div>
                    </div>
                    <p className="status-hint">Archivado: no recibe votos ni comentarios.</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {articles.length === 0 && (
            <div className="empty">No tienes artículos. ¡Crea uno nuevo!</div>
          )}
        </>
      )}
    </div>
  );
}