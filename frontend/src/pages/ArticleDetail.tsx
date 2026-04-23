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

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      setError('');
      try {
        const [articleData, commentsData, votesData] = await Promise.all([
          api.getArticle(slug),
          api.getComments(slug),
          api.getVotes(slug),
        ]);
        setArticle(articleData);
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

  return (
    <div className="article-detail">
      <Link to="/" className="back-link">Volver</Link>

      <h1>{article.title}</h1>
      <div className="article-meta">
        <span className="status">{article.status}</span>
        {article.tags && <span className="tags">{article.tags}</span>}
        {article.created_at && (
          <span className="date">
            {new Date(article.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="article-content">{article.content}</div>

      <div className="vote-section">
        <span>Puntuación: {votes?.score ?? 0}</span>
        {token && (
          <>
            <button onClick={() => handleVote('upvote')}>▲</button>
            <button onClick={() => handleVote('downvote')}>▼</button>
            {votemsg && <span className="error">{votemsg}</span>}
          </>
        )}
      </div>

      {isOwner && (
        <div className="author-actions">
          <Link to={`/articles/${article.slug}/edit`} className="btn-primary">
            Editar
          </Link>
        </div>
      )}

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

        {token && (
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
        )}
      </section>
    </div>
  );
}