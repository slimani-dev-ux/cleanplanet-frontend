// src/pages/ListeUtilisateurs.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RetourProfil from '../components/RetourProfil';
import Modal from '../components/Modal';
import api from '../api';
import { Trash2 } from 'lucide-react';

function ListeUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState({
    isAuthenticated: false,
    isAdmin: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  // 1) Identifier la session via le cookie (GET /auth/me)
  useEffect(() => {
    let mounted = true;

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!mounted) return;

        const role = String(data?.role || '').toLowerCase();
        const isAdmin = role === 'admin' || data?.is_admin === true;

        setSession({ isAuthenticated: true, isAdmin });

        if (!isAdmin) {
          setMessage('⛔ Accès réservé à l’administrateur.');
          navigate('/connexion');
        }
      })
      .catch(() => {
        if (!mounted) return;

        setSession({ isAuthenticated: false, isAdmin: false });
        setMessage('⛔ Accès interdit. Connectez-vous.');
        navigate('/connexion');
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // 2) Charger la liste des utilisateurs si admin
  useEffect(() => {
    if (!session.isAuthenticated || !session.isAdmin) return;

    let mounted = true;

    api
      .get('/users')
      .then(res => {
        if (!mounted) return;
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch(error => {
        console.error('❌ Erreur chargement utilisateurs :', error);
        const code = error?.response?.status;

        if (code === 401 || code === 403) {
          setMessage('Session invalide ou droits insuffisants.');
          navigate('/connexion');
          return;
        }

        setMessage(error?.response?.data?.message || '❌ Erreur serveur');
      });

    return () => {
      mounted = false;
    };
  }, [session.isAuthenticated, session.isAdmin, navigate]);

  // 3) Nettoyage du timer au démontage du composant
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 4) Suppression d’un utilisateur (protégée côté API)
  const handleDelete = async userId => {
    setUserToDelete(userId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/users/${userToDelete}`);
      setUsers(prev =>
        prev.filter(userItem => userItem.user_id !== userToDelete),
      );
      setMessage('✅ Utilisateur supprimé avec succès.');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Erreur suppression :', error);
      const code = error?.response?.status;

      if (code === 401 || code === 403) {
        setMessage('Session invalide ou droits insuffisants.');
        navigate('/connexion');
        return;
      }

      setMessage(
        error?.response?.data?.message || 'Erreur lors de la suppression.',
      );
    } finally {
      setIsModalOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <section className="users-section" aria-labelledby="users-title">
      <RetourProfil />

      <h2 id="users-title">👥 Liste des Utilisateurs</h2>

      {message && (
        <p aria-live="polite" role="status">
          {message}
        </p>
      )}

      {Array.isArray(users) && users.length > 0 ? (
        <ul className="users-list">
          {users.map(userItem => (
            <li className="users-item" key={userItem.user_id}>
              <article aria-label={`Utilisateur ${userItem.name}`}>
                <p>
                  <strong>{userItem.name}</strong> — {userItem.email}
                </p>

                {session.isAdmin && (
                  <div className="actions">
                    <button
                      type="button"
                      className="remove btn btn--with-text"
                      onClick={() => handleDelete(userItem.user_id)}
                      title="Supprimer">
                      <Trash2 size={18} aria-hidden="true" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </article>
            </li>
          ))}
        </ul>
      ) : (
        !message && <p>Aucun utilisateur trouvé.</p>
      )}

      <Modal
        open={isModalOpen}
        title="Confirmer la suppression"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Supprimer"
        cancelText="Annuler">
        Cette action supprimera définitivement l’utilisateur sélectionné.
      </Modal>
    </section>
  );
}

export default ListeUtilisateurs;
