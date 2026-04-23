import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TagInput } from '../components/TagInput';

interface ArticleFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: () => void;
}

export function ArticleForm({ isOpen = true, onClose, onSaved }: ArticleFormProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(!!slug);
  const { token } = useAuth();

  useEffect(() => {
    if (slug && token) {
      const fetchArticle = async () => {
        try {
          const article = await api.getArticle(slug);
          setTitle(article.title);
          setContent(article.content);
          setTags(article.tags ? article.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
          setStatus(article.status);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load article');
        } finally {
          setFetching(false);
        }
      };
      fetchArticle();
    } else if (!slug) {
      setTitle('');
      setContent('');
      setTags([]);
      setStatus('draft');
      setFetching(false);
    }
  }, [slug, token]);

  const statusLabel =
    status === 'draft' ? 'Borrador' : status === 'published' ? 'Publicado' : 'Archivado';
  const backTarget = slug ? `/articles/${slug}` : '/author';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (slug && status === 'archived') {
      setError('Los artículos archivados no se pueden editar.');
      setLoading(false);
      return;
    }

    try {
      const data = { 
        title, 
        content, 
        tags: tags.join(',')
      };

      if (slug) {
        await api.updateArticle(slug, data, token!);
      } else {
        await api.createArticle(data, token!);
      }

      if (onClose) {
        onClose();
      }

      if (onSaved) {
        onSaved();
      }

      navigate('/author');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">Cargando...</div>;
  }

  const isArchived = status === 'archived';

  return (
    <div className="article-form">
      <div className="form-header">
        <Link to={backTarget} className="back-square" aria-label="Volver">
          <span aria-hidden="true">&lt;</span>
        </Link>
        <h1>{slug ? 'Editar Artículo' : 'Nuevo Artículo'}</h1>
      </div>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={slug ? isArchived : false}
            required
          />
        </div>
        <div className="form-group">
          <label>Contenido</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            disabled={slug ? isArchived : false}
            required
          />
        </div>
        <div className="form-group">
          <label>Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>
        <div className="form-group">
          <label>Estado</label>
          <div className="status-display">
            <span className={`status-badge ${status}`}>{statusLabel}</span>
            {!slug && (
              <span className="status-hint">Se crea como borrador y luego puedes publicarlo.</span>
            )}
            {slug && isArchived && <span className="status-hint">Estado final: archivado.</span>}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading || !title || !content || (slug ? isArchived : false)}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          {onClose && (
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}