// src/pages/ListeOrganisations.jsx
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RetourProfil from '../components/RetourProfil';
import Modal from '../components/Modal';
import api from '../api';

function ListeOrganisations() {
  const [organisations, setOrganisations] = useState([]);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState({
    isAuthenticated: false,
    isAdmin: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);
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
    setOrganizationToDelete(organizationId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!organizationToDelete) return;

    try {
      await api.delete(`/organizations/${organizationToDelete}`);
      setOrganisations(prev =>
        prev.filter(
          organization => organization.organization_id !== organizationToDelete,
        ),
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
        error.response?.data?.message || 'Erreur suppression organisation';
      setMessage(`❌ ${msg}`);
    } finally {
      setIsModalOpen(false);
      setOrganizationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setOrganizationToDelete(null);
  };

  const handleEdit = organizationId =>
    navigate(`/modifier-organisation/${organizationId}`);

  return (
    <section
      className="organisations-section"
      aria-labelledby="organisations-title">
      <RetourProfil />

      <h2 id="organisations-title">Liste des Organisations</h2>

      {session.isAdmin && (
        <button
          type="button"
          className="btn btn--with-text"
          onClick={() => navigate('/ajouter-organisation')}
          title="Ajouter une organisation">
          <Plus size={18} aria-hidden="true" focusable="false" />
          <span>Ajouter une organisation</span>
        </button>
      )}

      {message && (
        <p aria-live="polite" role="status">
          {message}
        </p>
      )}

      {organisations.length === 0 ? (
        <p>Aucune organisation trouvée.</p>
      ) : (
        <ul className="organisations-list">
          {organisations.map(organization => (
            <li
              className="organisations-item"
              key={organization.organization_id}>
              <article aria-label={`Organisation ${organization.name}`}>
                <p>
                  <strong>{organization.name}</strong> — {organization.address}{' '}
                  — {organization.city} ({organization.postal_code})
                </p>

                {session.isAdmin && (
                  <div className="actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(organization.organization_id)}
                      className="btn btn--with-text"
                      title="Modifier">
                      <Pencil size={18} aria-hidden="true" />
                      <span>Modifier</span>
                    </button>

                    <button
                      type="button"
                      className="remove btn btn--with-text"
                      onClick={() => handleDelete(organization.organization_id)}
                      title="Supprimer">
                      <Trash2 size={18} aria-hidden="true" focusable="false" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={isModalOpen}
        title="Confirmer la suppression"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Supprimer"
        cancelText="Annuler">
        Cette action supprimera définitivement l’organisation sélectionnée.
      </Modal>
    </section>
  );
}

export default ListeOrganisations;
