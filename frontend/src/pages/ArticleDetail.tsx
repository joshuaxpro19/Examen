import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  author_id: number;
  status: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: number;
  content: string;
  user_id: number;
  article_id: number;
  created_at: string;
}

interface Vote {
  upvotes: number;
  downvotes: number;
  score: number;
}

export function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [votemsg, setVotemsg] = useState('');
  const { token, user } = useAuth();
  const getStatusLabel = (status: string) => {
    if (status === 'draft') return 'Borrador';
    if (status === 'published') return 'Publicado';
    if (status === 'archived') return 'Archivado';
    return status;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      setError('');
      try {
        const articleData = await api.getArticle(slug);
        setArticle(articleData);

        const [commentsData, votesData] = await Promise.all([
          api.getComments(slug),
          api.getVotes(slug),
        ]);
        setComments(commentsData);
        setVotes(votesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !token || !newComment.trim()) return;

    setCommentLoading(true);
    setCommentError('');
    try {
      await api.createComment(slug, newComment, token);
      const commentsData = await api.getComments(slug);
      setComments(commentsData);
      setNewComment('');
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleVote = async (voteType: string) => {
    if (!slug || !token) return;
    setVotemsg('');
    try {
      const votesData = await api.voteArticle(slug, voteType, token);
      setVotes(votesData);
    } catch (err) {
      setVotemsg(err instanceof Error ? err.message : 'Failed to vote');
    }
  };

  const handleArchive = async () => {
    if (!slug || !token) return;
    const confirmed = confirm('¿Deseas archivar este artículo?');
    if (!confirmed) return;

    try {
      await api.updateArticle(slug, { status: 'archived' }, token);
      setArticle((prev) => (prev ? { ...prev, status: 'archived' } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo archivar el artículo');
    }
  };

  if (loading) {
    return <div className="loading">Cargando artículo...</div>;
  }

  if (error || !article) {
    return <div className="error">{error || 'Artículo no encontrado'}</div>;
  }

  const isOwner = user?.id === article.author_id;
  const isArchived = article.status === 'archived';
  const canArchive = isOwner && article.status === 'published';
  const tags = article.tags
    ? article.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : [];

  return (
    <div className="article-detail">
      <div className="article-topbar">
        <Link to="/" className="back-square" aria-label="Volver">
          <span aria-hidden="true">&lt;</span>
        </Link>
      </div>

      <div className="article-title-row">
        <h1>{article.title}</h1>
        {isOwner && (
          <div className="title-actions">
            {!isArchived && (
              <Link to={`/articles/${article.slug}/edit`} className="btn-primary edit-button">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25zm15.71-9.04a1.003 1.003 0 000-1.42l-2.5-2.5a1.003 1.003 0 00-1.42 0l-1.96 1.96 2.75 2.75 1.13-1.13z" fill="currentColor" />
                </svg>
                <span>Editar</span>
              </Link>
            )}
            {canArchive && (
              <button className="btn-archive" onClick={handleArchive}>
                Archivar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="article-meta">
        <span className={`status status-${article.status}`}>{getStatusLabel(article.status)}</span>
        {tags.map((tag) => (
          <span key={tag} className="article-tag">#{tag}</span>
        ))}
        {article.created_at && (
          <span className="date">
            {new Date(article.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="article-content">{article.content}</div>

      {isArchived && (
        <div className="archived-notice">Este artículo está archivado. Puedes ver historial, pero no votar ni comentar.</div>
      )}

      <div className="vote-card">
        <div className="vote-stats">
          <div className="vote-stat">
            <strong>{votes?.score ?? 0}</strong>
            <span>Puntuación</span>
          </div>
          <div className="vote-stat">
            <strong>{votes?.upvotes ?? 0}</strong>
            <span>Me gusta</span>
          </div>
          <div className="vote-stat">
            <strong>{votes?.downvotes ?? 0}</strong>
            <span>No me gusta</span>
          </div>
        </div>
        {token && (
          <div className="vote-actions">
            <button
              className="vote-up vote-icon-btn"
              onClick={() => handleVote('upvote')}
              disabled={isArchived}
              aria-label="Me gusta"
              title="Me gusta"
            >
              <span aria-hidden="true">👍</span>
            </button>
            <button
              className="vote-down vote-icon-btn"
              onClick={() => handleVote('downvote')}
              disabled={isArchived}
              aria-label="No me gusta"
              title="No me gusta"
            >
              <span aria-hidden="true">👎</span>
            </button>
          </div>
        )}
        {votemsg && <div className="error">{votemsg}</div>}
      </div>

      <section className="comments-section">
        <div className="comments-header">
          <h2>Comentarios</h2>
          <span>{comments.length}</span>
        </div>

        {comments.length === 0 ? (
          <div className="empty">No hay comentarios aún</div>
        ) : (
          <ul className="comments-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment">
                <p>{comment.content}</p>
                <span className="comment-date">
                  {comment.created_at && new Date(comment.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}

        {token ? (
          isArchived ? (
            <p className="muted">Los comentarios están en modo solo lectura porque el artículo está archivado.</p>
          ) : (
            <form onSubmit={handleComment} className="comment-form">
              <h3>Agregar comentario</h3>
              {commentError && <div className="error">{commentError}</div>}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario..."
                required
              />
              <button type="submit" disabled={commentLoading}>
                {commentLoading ? 'Enviando...' : 'Publicar comentario'}
              </button>
            </form>
          )
        ) : (
          <p className="muted">Inicia sesión para comentar y votar.</p>
        )}
      </section>
    </div>
  );
}