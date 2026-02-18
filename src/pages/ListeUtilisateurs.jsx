// src/pages/ListeUtilisateurs.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RetourProfil from '../components/RetourProfil';
import api from '../api';
import { Trash2 } from 'lucide-react';

function ListeUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState({
    isAuthenticated: false,
    isAdmin: false,
  });
  const navigate = useNavigate();

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

  // 3) Suppression d’un utilisateur (protégée côté API)
  const handleDelete = async userId => {
    if (!window.confirm('🗑️ Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setMessage('✅ Utilisateur supprimé avec succès.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erreur suppression :', error);
      const code = error?.response?.status;
      if (code === 401 || code === 403) {
        setMessage('Session invalide ou droits insuffisants.');
        navigate('/connexion');
        return;
      }
      setMessage(
        error?.response?.data?.message || 'Erreur lors de la suppression.'
      );
    }
  };

  return (
    <div className="users-section">
      <RetourProfil />

      <h2>👥 Liste des Utilisateurs</h2>
      {message && <p aria-live="polite">{message}</p>}

      {Array.isArray(users) && users.length > 0 ? (
        <ul className="users-list">
          {users.map(userItem => (
            <li className="users-item" key={userItem.user_id}>
              <strong>{userItem.name}</strong> — {userItem.email}
              {session.isAdmin && (
                <button
                  className="remove"
                  onClick={() => handleDelete(userItem.user_id)}
                  aria-label="Supprimer"
                  title="Supprimer">
                  <Trash2 size={18} aria-hidden="true" />
                  <span className="sr-only">Supprimer</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !message && <p>Aucun utilisateur trouvé.</p>
      )}
    </div>
  );
}

export default ListeUtilisateurs;
