// src/pages/ProfilMembre.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Trash2, Pencil, FilePlus } from 'lucide-react';

function ProfilMembre() {
  const [session, setSession] = useState({ loading: true, member: null });
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 1) Vérifie la session via /members/me (cookie httpOnly)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/members/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        });
        const role = String(data?.role || '').toLowerCase();
        if (role !== 'member' || !data.member_id) {
          navigate('/connexion-membre', { replace: true });
          return;
        }
        if (!alive) return;
        setSession({
          loading: false,
          member: {
            member_id: data.member_id,
            name: data.name ?? '',
            email: data.email ?? '',
          },
        });

        // 2) Charge les articles du membre
        try {
          const res = await api.get(`/articles/member/${data.member_id}`, {
            validateStatus: s => (s >= 200 && s < 300) || s === 404,
          });
          setArticles(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
          console.error('Erreur chargement articles membre :', e);
          setArticles([]);
        }
      } catch {
        navigate('/connexion-membre', { replace: true });
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  // 3) Suppression compte
  const handleDelete = async () => {
    if (!session.member) return;
    if (!window.confirm('Supprimer définitivement votre compte ?')) return;
    try {
      await api.delete(`/members/${session.member.member_id}`, {
        validateStatus: s => s >= 200 && s < 300,
      });
      await api.post('/auth/logout', null, {
        
        validateStatus: s => s >= 200 && s < 300,
      }); // supprime le cookie
      // nettoyage hérité
      try {
        localStorage.removeItem('token_membre');
        localStorage.removeItem('member');
        sessionStorage.clear();
      } catch {}
      window.dispatchEvent(new Event('auth:updated'));
      navigate('/', { replace: true });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401 || code === 403) {
        navigate('/connexion-membre', { replace: true });
        return;
      }
      setMessage(err?.response?.data?.message || '❌ Suppression impossible.');
    }
  };
  if (session.loading)
    return (
      <p role="status" aria-busy="true">
        Chargement…
      </p>
    );
  const membre = session.member;

  return (
    <section className="member-profile-section">
      <h2>👤 Profil Membre</h2>
      {message && (
        <p role="status" aria-live="polite" style={{ marginBottom: 12 }}>
          {message}
        </p>
      )}
      {membre && (
        <>
          <p>
            <strong>Nom :</strong> {membre.name}
          </p>
          <p>
            <strong>Email :</strong> {membre.email}
          </p>

          <ul className="actions-list">
            <li className="actions-item">
              <button
                className="remove"
                onClick={handleDelete}
                aria-label="Supprimer mon compte"
                title="Supprimer mon compte">
                <Trash2 size={18} aria-hidden="true" />
                <span className="sr-only">Supprimer mon compte</span>
              </button>
            </li>

            <li className="actions-item">
              <button
                onClick={() =>
                  navigate('/modifier-profil-membre', { replace: true })
                }
                aria-label="Modifier mes informations"
                title="Modifier mes informations">
                <Pencil size={18} aria-hidden="true" />
                <span className="sr-only">Modifier mes informations</span>
              </button>
            </li>

            <li className="actions-item">
              <Link
                to="/ajouter"
                className="button-link"
                aria-label="Ajouter un article"
                title="Ajouter un article">
                <FilePlus size={18} aria-hidden="true" />
                <span className="sr-only">Ajouter un article</span>
              </Link>
            </li>
          </ul>
        </>
      )}

      <h3>📝 Mes articles publiés</h3>

      {articles.length > 0 ? (
        <ul className="articles-list">
          {articles.map(a => (
            <li key={a.article_id} className="articles-item">
              <h4>{a.title}</h4>+
              <p
                className="article-description"
                style={{ whiteSpace: 'pre-wrap' }}>
                {a.description}
              </p>
              {a.image && (
                <img
                  className="article-image"
                  src={`http://localhost:5000/uploads/${a.image}`}
                  alt={`Illustration : ${a.title}`}
                />
              )}
              <p className="article-meta">
                🕒 <strong>Publié le :</strong>{' '}
                {a.created_at
                  ? new Date(a.created_at).toLocaleString('fr-FR')
                  : '—'}
              </p>
              <ul className="item-actions">
                <li>
                  <button
                    onClick={() =>
                      navigate(`/modifier-article/${a.article_id}`)
                    }
                    aria-label="Modifier"
                    title="Modifier">
                    <Pencil size={18} aria-hidden="true" />
                    <span className="sr-only">Modifier </span>
                  </button>
                </li>
                <li>
                  <button
                    className="remove"
                    onClick={() => handleDeleteArticle(a.article_id)}
                    aria-label="Supprimer"
                    title="Supprimer ">
                    <Trash2 size={18} aria-hidden="true" />
                    <span className="sr-only">Supprimer</span>
                  </button>
                </li>
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun article trouvé.</p>
      )}
    </section>
  );

  // --- helpers ---
  async function handleDeleteArticle(articleId) {
    if (!window.confirm('🗑️ Supprimer cet article ?')) return;
    try {
      await api.delete(`/articles/${articleId}`, {
        validateStatus: s => s >= 200 && s < 300,
      });
      setArticles(prev => prev.filter(x => x.article_id !== articleId));
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401 || code === 403) {
        setMessage('⛔ Action non autorisée.');
      } else setMessage('❌ Erreur suppression article.');
    }
  }
}

export default ProfilMembre;
