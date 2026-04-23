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
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user?.role === 'author') {
      const fetchArticles = async () => {
        try {
          const data = await api.getMyArticles(token);
          setArticles(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load articles');
        } finally {
          setLoading(false);
        }
      };
      fetchArticles();
    }
  }, [token, user]);

  const handleStatusChange = async (slug: string, newStatus: string) => {
    if (!token) return;
    try {
      await api.updateArticle(slug, { status: newStatus }, token);
      setArticles(articles.map((a) => (a.slug === slug ? { ...a, status: newStatus } : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!token || !confirm('¿Estás seguro de eliminar este artículo?')) return;
    try {
      await api.deleteArticle(slug, token);
      setArticles(articles.filter((a) => a.slug !== slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    }
  };

  if (user?.role !== 'author') {
    return <div className="error">Solo autores pueden ver este panel</div>;
  }

  return (
    <div className="author-panel">
      <h1>Mis Artículos</h1>
      <Link to="/articles/new" className="btn-primary">
        Nuevo Artículo
      </Link>

      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && articles.length === 0 && (
        <div className="empty">No tienes artículos</div>
      )}

      <table className="articles-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>
                <Link to={`/articles/${article.slug}`}>{article.title}</Link>
              </td>
              <td>
                <select
                  value={article.status}
                  onChange={(e) => handleStatusChange(article.slug, e.target.value)}
                  disabled={article.status === 'archived'}
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </td>
              <td>
                <Link to={`/articles/${article.slug}/edit`}>Editar</Link>
                <button onClick={() => handleDelete(article.slug)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}