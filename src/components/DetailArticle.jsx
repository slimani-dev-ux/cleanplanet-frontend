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
        if (mounted) setMessage('❌ Erreur de chargement');
      } finally {
        if (mounted) setLoading(false);
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
        { validateStatus: s => s >= 200 && s < 300 }
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
    <div style={{ padding: '20px' }}>
      {loading ? (
        <p role="status" aria-busy="true">
          Chargement...
        </p>
      ) : article ? (
        <>
          <h2>{article.title}</h2>

          {/* ✅ Sauts de ligne respectés */}
          <p style={{ whiteSpace: 'pre-wrap' }}>{article.description}</p>

          <p>
            <strong>Auteur :</strong> {article.author_name}
          </p>

          {article.image && (
            <img
              src={`http://localhost:5000/uploads/${article.image}`}
              alt={`Illustration : ${article.title}`}
              style={{ width: '300px', margin: '10px 0' }}
            />
          )}

          <h3>💬 Commentaires</h3>
          {comments.length > 0 ? (
            comments.map(c => (
              <p key={c.comment_id}>
                <strong>{c.user_name || '👤 Anonyme'}:</strong> {c.content}
              </p>
            ))
          ) : (
            <p>Aucun commentaire pour le moment.</p>
          )}

          {/* ✅ Formulaire visible uniquement pour les utilisateurs standards */}
          {role === 'user' && (
            <div style={{ marginTop: '15px' }}>
              <label htmlFor="new-comment">Écrire un commentaire</label>
              <textarea
                id="new-comment"
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                aria-required="true"
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
            </div>
          )}

          {message && (
            <p style={{ marginTop: '10px' }} aria-live="polite" role="status">
              {message}
            </p>
          )}
        </>
      ) : (
        <p role="status" aria-live="polite">
          {message || 'Aucun contenu.'}
        </p>
      )}
    </div>
  );
}

export default DetailArticle;
