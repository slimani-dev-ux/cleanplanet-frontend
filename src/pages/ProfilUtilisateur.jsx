// src/pages/ProfilUtilisateur.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Trash2, Pencil, MessageSquareText } from 'lucide-react';

/** Profil utilisateur : vérifie la session via /auth/me (cookie), affiche les infos,
 * permet déconnexion / suppression / édition. */
function ProfilUtilisateur() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Vérifie la session côté serveur (cookie token_membre)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/auth/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        }); // { role, is_admin, user_id, email, name, ... }
        const role = String(data?.role || '').toLowerCase();

        // Redirige si ce n’est pas un “user” standard
        if (role === 'admin') {
          navigate('/profil-admin', { replace: true });
          return;
        }
        if (role === 'member') {
          navigate('/profil-membre', { replace: true });
          return;
        }

        if (!alive) return;
        setUser({
          user_id: data.user_id,
          name: data.name ?? '',
          email: data.email ?? '',
        });
      } catch {
        // Pas authentifié → page de connexion
        navigate('/connexion', { replace: true });
        return;
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  if (loading)
    return (
      <p role="status" aria-busy="true">
        Chargement…
      </p>
    );

  // Suppression compte
  const handleDelete = async () => {
    if (!user?.user_id) return;
    if (!window.confirm('Supprimer définitivement votre compte ?')) return;

    try {
      // Suppression via cookie HttpOnly (pas d'Authorization hérité)
      await api.delete(`/users/${user.user_id}`, {
        validateStatus: s => s >= 200 && s < 300,
      });
      await api.post('/auth/logout', null, {
        validateStatus: s => s >= 200 && s < 300,
      }); // supprime le cookie

      // Nettoyage côté client (héritage)
      localStorage.removeItem('token');
      localStorage.removeItem('token_membre');
      localStorage.removeItem('user');
      localStorage.removeItem('membre');
      sessionStorage.clear();

      // Informe le Header de se rafraîchir
      window.dispatchEvent(new Event('auth:updated'));

      navigate('/', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        navigate('/connexion', { replace: true });
        return;
      }
      setMessage(err?.response?.data?.message || '❌ Suppression impossible.');
    }
  };

  return (
    <section className="user-profile-section">
      <h2>👤 Profil Utilisateur</h2>
      {message && (
        <p style={{ marginBottom: 12 }} role="status" aria-live="polite">
          {message}
        </p>
      )}
      {user && (
        <>
          <p>
            <strong>Nom :</strong> {user.name}
          </p>
          <p>
            <strong>Email :</strong> {user.email}
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
                className="edit"
                onClick={() => navigate('/modifier-profil-utilisateur')}
                aria-label="Modifier mes informations"
                title="Modifier mes informations">
                <Pencil size={18} aria-hidden="true" />
                <span className="sr-only">Modifier mes informations</span>
              </button>
            </li>
          </ul>

          <button
            className="comment"
            onClick={() =>
              navigate('/liste-articles', { state: { mode: 'user' } })
            }
            aria-label="Voir et commenter les articles"
            title="Voir et commenter les articles">
            <MessageSquareText size={18} aria-hidden="true" />
            <span className="sr-only">Voir et commenter les articles</span>
          </button>
        </>
      )}
    </section>
  );
}

export default ProfilUtilisateur;
