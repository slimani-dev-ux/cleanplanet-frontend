// src/pages/ProfilUtilisateur.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import { Trash2, Pencil, MessageSquareText } from 'lucide-react';

function ProfilUtilisateur() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Vérifie la session côté serveur
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await api.get('/auth/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        });

        const role = String(data?.role || '').toLowerCase();

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

  if (loading) {
    return (
      <p role="status" aria-busy="true">
        Chargement…
      </p>
    );
  }

  // Suppression compte (appelée via la modale)
  const handleDelete = async () => {
    if (!user?.user_id) return;

    try {
      await api.delete(`/users/${user.user_id}`, {
        validateStatus: s => s >= 200 && s < 300,
      });

      await api.post('/auth/logout', null, {
        validateStatus: s => s >= 200 && s < 300,
      });

      window.dispatchEvent(new Event('auth:updated'));
      navigate('/', { replace: true });
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        navigate('/connexion', { replace: true });
        return;
      }

      setMessage(err?.response?.data?.message || '❌ Suppression impossible.');
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <section
      className="user-profile-section"
      aria-labelledby="user-profile-title">
      <Modal
        open={isModalOpen}
        title="Confirmer la suppression du compte"
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        confirmText="Supprimer"
        cancelText="Annuler">
        Cette action supprimera définitivement votre compte utilisateur.
      </Modal>

      <h2 id="user-profile-title">👤 Profil Utilisateur</h2>

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
                type="button"
                className="remove btn btn--with-text"
                onClick={() => setIsModalOpen(true)}
                title="Supprimer mon compte">
                <Trash2 size={18} aria-hidden="true" />
                <span>Supprimer mon compte</span>
              </button>
            </li>

            <li className="actions-item">
              <button
                type="button"
                className="btn btn--with-text"
                onClick={() => navigate('/modifier-profil-utilisateur')}
                title="Modifier mes informations">
                <Pencil size={18} aria-hidden="true" />
                <span>Modifier mes informations</span>
              </button>
            </li>
          </ul>

          <button
            type="button"
            className="btn btn--with-text"
            onClick={() =>
              navigate('/liste-articles', { state: { mode: 'user' } })
            }
            title="Voir et commenter les articles">
            <MessageSquareText size={18} aria-hidden="true" />
            <span>Voir les articles</span>
          </button>
        </>
      )}
    </section>
  );
}

export default ProfilUtilisateur;
