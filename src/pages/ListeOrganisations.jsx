// src/pages/ListeOrganisations.jsx
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RetourProfil from '../components/RetourProfil';
import api from '../api';

function ListeOrganisations() {
  const [organisations, setOrganisations] = useState([]);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState({
    isAuthenticated: false,
    isAdmin: false,
  });
  const navigate = useNavigate();

  // 1) Qui suis-je ? (lecture via cookie httpOnly)
  useEffect(() => {
    let mounted = true;
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!mounted) return;
        const role = String(data?.role || '').toLowerCase();
        setSession({
          isAuthenticated: true,
          isAdmin: role === 'admin' || data?.is_admin === true,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setSession({ isAuthenticated: false, isAdmin: false });
        // Optionnel : rediriger vers /connexion si non auth
        navigate('/connexion');
      });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // 2) Charger les organisations si admin
  useEffect(() => {
    if (!session.isAuthenticated || !session.isAdmin) return;
    let mounted = true;
    api
      .get('/organizations')
      .then(res => {
        if (!mounted) return;
        setOrganisations(Array.isArray(res.data) ? res.data : []);
      })
      .catch(error => {
        console.error('❌ Erreur chargement organisations:', error);
        const code = error?.response?.status;
        if (code === 401 || code === 403) {
          setMessage('Session invalide ou droits insuffisants.');
          navigate('/connexion');
          return;
        }
        setMessage('❌ Erreur serveur');
      });
    return () => {
      mounted = false;
    };
  }, [session.isAuthenticated, session.isAdmin, navigate]);

  const handleDelete = async organizationId => {
    if (!window.confirm('Supprimer cette organisation ?')) return;
    try {
      await api.delete(`/organizations/${organizationId}`);
      setOrganisations(prev =>
        prev.filter(o => o.organization_id !== organizationId)
      );
      setMessage('✅ Organisation supprimée');
    } catch (error) {
      console.error('Erreur suppression organisation:', error);
      const code = error?.response?.status;
      if (code === 401 || code === 403) {
        setMessage('Session invalide ou droits insuffisants.');
        navigate('/connexion');
        return;
      }
      const msg =
        error.response?.data?.message || '❌ Erreur suppression organisation';
      setMessage(`❌ ${msg}`);
    }
  };

  const handleEdit = organizationId =>
    navigate(`/modifier-organisation/${organizationId}`);

  return (
    <div className="organisations-section">
      <RetourProfil />

      <h2>Liste des Organisations</h2>

      {session.isAdmin && (
        <button
          type="button"
          className="btn btn--with-text"
          onClick={() => navigate('/ajouter-organisation')}
          title="Ajouter une organisation">
          <Plus size={18} aria-hidden="true" focusable="false" />
          <span className="sr-only">Ajouter une organisation</span>
        </button>
      )}

      {message && <p aria-live="polite">{message}</p>}

      {organisations.length === 0 ? (
        <p>Aucune organisation trouvée.</p>
      ) : (
        <ul className="organisations-list">
          {organisations.map(organization => (
            <li
              className="organisations-item"
              key={organization.organization_id}>
              <strong>{organization.name}</strong> - {organization.address} -{' '}
              {organization.city} ({organization.postal_code})
              {session.isAdmin && (
                <>
                  <button
                    onClick={() => handleEdit(organization.organization_id)}
                    aria-label="Modifier l’organisation"
                    className="btn btn--with-text"
                    title="Modifier">
                    <Pencil size={18} aria-hidden="true" />
                    <span className="sr-only">Modifier</span>
                  </button>

                  <button
                    type="button"
                    className="remove"
                    onClick={() => handleDelete(organization.organization_id)}
                    title="Supprimer">
                    <Trash2 size={18} aria-hidden="true" focusable="false" />
                    <span className="sr-only">Supprimer</span>
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListeOrganisations;
