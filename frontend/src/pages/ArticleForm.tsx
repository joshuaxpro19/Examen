import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ArticleForm() {
  const { slug } = useParams<{ slug: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(!!slug);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (slug && token) {
      const fetchArticle = async () => {
        try {
          const article = await api.getArticle(slug);
          setTitle(article.title);
          setContent(article.content);
          setTags(article.tags);
          setStatus(article.status);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load article');
        } finally {
          setFetching(false);
        }
      };
      fetchArticle();
    }
  }, [slug, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = { title, content, tags };
      if (slug) {
        await api.updateArticle(slug, { ...data, status }, token!);
      } else {
        await api.createArticle(data, token!);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="article-form">
      <h1>{slug ? 'Editar Artículo' : 'Nuevo Artículo'}</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Contenido</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
          />
        </div>
        <div className="form-group">
          <label>Tags (separados por coma)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="react, python, fastapi"
          />
        </div>
        <div className="form-group">
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}