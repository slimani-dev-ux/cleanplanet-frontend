// src/pages/ListeArticles.jsx
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { Trash2, MessageSquareText, X } from 'lucide-react';
import FormulaireCommentaire from '../components/FormulaireCommentaire';
import Modal from '../components/Modal';

function ListeArticles(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.state?.mode ?? props?.mode ?? 'public';
  const isPublicPage = mode === 'public';
  const showBackToProfile = mode === 'admin';

  // --- états ---
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState('');
  const [commentsByArticleId, setCommentsByArticleId] = useState({});
  const [me, setMe] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const isAdmin = useMemo(() => me?.role === 'admin', [me]);
  const isUserStandard = useMemo(() => me?.role === 'user', [me]);

  // 1) Qui suis-je ? (cookie httpOnly)
  useEffect(() => {
    if (isPublicPage) {
      setMe(null);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const { data } = await api.get('/auth/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        });

        if (!mounted) return;
        setMe(data || null);
      } catch {
        if (mounted) {
          setMe(null);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isPublicPage]);

  // 2) Charger les articles puis leurs commentaires
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: articlesData } = await api.get('/articles');

        if (!mounted) return;
        setArticles(articlesData);

        const nextIndex = {};

        await Promise.all(
          (articlesData || []).map(async article => {
            try {
              const { data } = await api.get(
                `/articles/${article.article_id}/comments`,
              );
              nextIndex[article.article_id] = data;
            } catch {
              nextIndex[article.article_id] = [];
            }
          }),
        );

        if (mounted) {
          setCommentsByArticleId(nextIndex);
        }
      } catch (error) {
        console.error('Erreur chargement articles :', error);
        if (mounted) {
          setMessage('Erreur serveur');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Recharger les commentaires d’un article (utilisé après ajout)
  async function refreshComments(articleId) {
    try {
      const { data } = await api.get(`/articles/${articleId}/comments`);
      setCommentsByArticleId(prev => ({ ...prev, [articleId]: data }));
    } catch {
      // silencieux
    }
  }

  const handleDeleteArticle = async articleId => {
    setArticleToDelete(articleId);
    setIsModalOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;

    try {
      await api.delete(`/articles/${articleToDelete}`);
      setArticles(prev =>
        prev.filter(article => article.article_id !== articleToDelete),
      );
      setMessage('✅ Article supprimé avec succès.');
    } catch (error) {
      console.error('Erreur suppression :', error);
      setMessage('❌ Erreur lors de la suppression de l’article.');
    } finally {
      setIsModalOpen(false);
      setArticleToDelete(null);
    }
  };

  const cancelDeleteArticle = () => {
    setIsModalOpen(false);
    setArticleToDelete(null);
  };

  const toggleCommentForm = articleId => {
    setExpanded(prev => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  // --- rendu commentaires ---
  const renderComments = articleId => {
    const comments = commentsByArticleId[articleId] || [];

    if (comments.length === 0) {
      return (
        <div className="no-comments">Aucun commentaire pour cet article.</div>
      );
    }

    return (
      <div className="with-comments">
        <strong>Commentaires :</strong>
        <ul>
          {comments.map(c => (
            <li key={c.comment_id}>
              <strong>{c.user_name || 'Anonyme'} :</strong> {c.content}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section className="articles-section" aria-labelledby="articles-title">
      {showBackToProfile && (
        <button
          type="button"
          className="retour-profil-btn"
          onClick={() => navigate('/profil-admin')}
          aria-label="Retour au profil administrateur"
          title="Retour au profil">
          ← Retour au profil
        </button>
      )}

      <h2 id="articles-title">Liste des Articles</h2>

      {message && (
        <p className="status" aria-live="polite" role="status">
          {message}
        </p>
      )}

      {Array.isArray(articles) && articles.length > 0 ? (
        <ul className="articles-list">
          {articles.map(article => (
            <li key={article.article_id} className="articles-item">
              <article aria-labelledby={`article-title-${article.article_id}`}>
                <h3 id={`article-title-${article.article_id}`}>
                  {article.title}
                </h3>

                <p
                  className="article-description"
                  style={{ whiteSpace: 'pre-wrap' }}>
                  {article.description}
                </p>

                <p>
                  <strong>Auteur :</strong> {article.author_name}
                </p>

                {article.image && (
                  <img
                    className="article-image"
                    src={`http://localhost:5000/uploads/${article.image}`}
                    alt={`Illustration de l’article ${article.title}`}
                  />
                )}

                <small className="meta">
                  🕒 <strong>Publié le :</strong>{' '}
                  {new Date(article.created_at).toLocaleString('fr-FR')}
                </small>

                {renderComments(article.article_id)}

                <div className="actions">
                  {isAdmin && !isPublicPage && (
                    <button
                      type="button"
                      className="remove"
                      onClick={() => handleDeleteArticle(article.article_id)}
                      aria-label="Supprimer l’article"
                      title="Supprimer l’article">
                      <Trash2 size={18} aria-hidden />
                      <span className="sr-only">Supprimer</span>
                    </button>
                  )}

                  {isUserStandard && !isPublicPage && (
                    <button
                      type="button"
                      className="comment"
                      onClick={() => toggleCommentForm(article.article_id)}
                      aria-expanded={!!expanded[article.article_id]}
                      aria-controls={`cform-${article.article_id}`}
                      aria-label={
                        expanded[article.article_id]
                          ? 'Fermer le formulaire de commentaire'
                          : 'Ouvrir le formulaire de commentaire'
                      }
                      title={
                        expanded[article.article_id] ? 'Fermer' : 'Commenter'
                      }>
                      {expanded[article.article_id] ? (
                        <X size={18} aria-hidden />
                      ) : (
                        <MessageSquareText size={18} aria-hidden />
                      )}
                      <span className="sr-only">
                        {expanded[article.article_id] ? 'Fermer' : 'Commenter'}
                      </span>
                    </button>
                  )}
                </div>

                {expanded[article.article_id] &&
                  isUserStandard &&
                  !isPublicPage && (
                    <div
                      id={`cform-${article.article_id}`}
                      className="comment-form">
                      <FormulaireCommentaire
                        articleId={article.article_id}
                        onCommentAdded={() =>
                          refreshComments(article.article_id)
                        }
                      />
                    </div>
                  )}
              </article>

              <hr className="divider" />
            </li>
          ))}
        </ul>
      ) : (
        !message && <p>Aucun article trouvé.</p>
      )}

      <Modal
        open={isModalOpen}
        title="Confirmer la suppression"
        onCancel={cancelDeleteArticle}
        onConfirm={confirmDeleteArticle}
        confirmText="Supprimer"
        cancelText="Annuler">
        Cette action supprimera définitivement l’article sélectionné.
      </Modal>
    </section>
  );
}

export default ListeArticles;
