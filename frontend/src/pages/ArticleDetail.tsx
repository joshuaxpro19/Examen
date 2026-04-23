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

        if (articleData.status === 'archived') {
          setComments([]);
          setVotes({ upvotes: 0, downvotes: 0, score: 0 });
          return;
        }

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

  if (loading) {
    return <div className="loading">Cargando artículo...</div>;
  }

  if (error || !article) {
    return <div className="error">{error || 'Artículo no encontrado'}</div>;
  }

  const isOwner = user?.id === article.author_id;
  const isArchived = article.status === 'archived';

  return (
    <div className="article-detail">
      <Link to="/" className="back-link">Volver</Link>

      <h1>{article.title}</h1>
      <div className="article-meta">
        <span className={`status status-${article.status}`}>{getStatusLabel(article.status)}</span>
        {article.tags && <span className="tags">{article.tags}</span>}
        {article.created_at && (
          <span className="date">
            {new Date(article.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="article-content">{article.content}</div>

      {isArchived ? (
        <div className="archived-notice">Este artículo está archivado y ya no acepta votos ni comentarios.</div>
      ) : (
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
              <button className="vote-up" onClick={() => handleVote('upvote')}>+1 Me gusta</button>
              <button className="vote-down" onClick={() => handleVote('downvote')}>-1 No me gusta</button>
            </div>
          )}
          {votemsg && <div className="error">{votemsg}</div>}
        </div>
      )}

      {isOwner && !isArchived && (
        <div className="author-actions">
          <Link to={`/articles/${article.slug}/edit`} className="btn-primary">
            Editar
          </Link>
        </div>
      )}

      {!isArchived && (
        <section className="comments-section">
          <h2>Comentarios</h2>
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
                {commentLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
          ) : (
            <p className="muted">Inicia sesión para comentar y votar.</p>
          )}
        </section>
      )}
    </div>
  );
}