// src/components/DetailArticle.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function DetailArticle() {
  const { id } = useParams();

  // États locaux
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Identifier le rôle utilisateur via /auth/me (Qui suis-je ?)
  useEffect(() => {
    api
      .get('/auth/me', {
        validateStatus: s => (s >= 200 && s < 300) || s === 401,
      })
      .then(res => {
        const roleValue = String(res.data?.role || '').toLowerCase();
        setRole(roleValue);
      })
      .catch(() => setRole(null));
  }, []);

  // 2️⃣ Charger article + commentaires
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setMessage('');

    (async () => {
      try {
        const [artRes, comRes] = await Promise.all([
          api.get(`/articles/${id}`, {
            validateStatus: s => (s >= 200 && s < 300) || s === 404,
          }),
          api.get(`/articles/${id}/comments`, {
            validateStatus: s => (s >= 200 && s < 300) || s === 404,
          }),
        ]);

        if (!mounted) return;

        if (artRes.status === 404) {
          setMessage('❌ Article introuvable');
          setArticle(null);
          setComments([]);
        } else {
          setArticle(artRes.data);
          setComments(Array.isArray(comRes.data) ? comRes.data : []);
        }
      } catch {
        if (mounted) {
          setMessage('❌ Erreur de chargement');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // 3️⃣ Ajout d’un commentaire
  const handleComment = async () => {
    if (!newComment.trim()) {
      setMessage('⚠️ Veuillez entrer un commentaire.');
      return;
    }

    try {
      setSending(true);

      await api.post(
        `/articles/${id}/comments`,
        { content: newComment },
        { validateStatus: s => s >= 200 && s < 300 },
      );

      const res = await api.get(`/articles/${id}/comments`, {
        validateStatus: s => (s >= 200 && s < 300) || s === 404,
      });

      setComments(Array.isArray(res.data) ? res.data : []);
      setNewComment('');
      setMessage('✅ Commentaire ajouté !');
    } catch {
      setMessage('❌ Erreur ajout commentaire');
    } finally {
      setSending(false);
    }
  };

  return (
    <main style={{ padding: '20px' }}>
      {loading ? (
        <p role="status" aria-busy="true" aria-live="polite">
          Chargement...
        </p>
      ) : article ? (
        <>
          <article aria-labelledby="article-title">
            <header>
              <h2 id="article-title">{article.title}</h2>
              <p>
                <strong>Auteur :</strong> {article.author_name}
              </p>
            </header>

            <section aria-labelledby="article-content-title">
              <h3 id="article-content-title" className="sr-only">
                Contenu de l’article
              </h3>

              <p style={{ whiteSpace: 'pre-wrap' }}>{article.description}</p>

              {article.image && (
                <img
                  src={`http://localhost:5000/uploads/${article.image}`}
                  alt={`Illustration de l’article ${article.title}`}
                  style={{ width: '300px', margin: '10px 0' }}
                />
              )}
            </section>
          </article>

          <section
            aria-labelledby="comments-title"
            style={{ marginTop: '20px' }}>
            <h3 id="comments-title">💬 Commentaires</h3>

            {comments.length > 0 ? (
              <ul style={{ paddingLeft: '20px' }}>
                {comments.map(c => (
                  <li key={c.comment_id}>
                    <p>
                      <strong>{c.user_name || '👤 Anonyme'} :</strong>{' '}
                      {c.content}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun commentaire pour le moment.</p>
            )}
          </section>

          {role === 'user' && (
            <section
              aria-labelledby="comment-form-title"
              style={{ marginTop: '15px' }}>
              <h3 id="comment-form-title">Ajouter un commentaire</h3>

              <label htmlFor="new-comment">Écrire un commentaire</label>
              <textarea
                id="new-comment"
                name="newComment"
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                aria-required="true"
                aria-describedby={message ? 'comment-message' : undefined}
              />

              <button
                type="button"
                onClick={handleComment}
                disabled={sending || !newComment.trim()}>
                {sending ? 'Envoi…' : 'Envoyer'}
              </button>

              <p aria-live="polite" role="status" className="sr-only">
                {sending ? 'Envoi du commentaire en cours' : ''}
              </p>
            </section>
          )}

          {message && (
            <p
              id="comment-message"
              style={{ marginTop: '10px' }}
              aria-live="polite"
              role="status">
              {message}
            </p>
          )}
        </>
      ) : (
        <p role="status" aria-live="polite">
          {message || 'Aucun contenu.'}
        </p>
      )}
    </main>
  );
}

export default DetailArticle;
