// src/pages/ListeMembres.jsx
// Page admin : liste des membres — chargement initial, suppression, et feedback utilisateur.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RetourProfil from '../components/RetourProfil';
import Modal from '../components/Modal';
import api from '../api';
import { Trash2 } from 'lucide-react';

function ListeMembres() {
  const [membres, setMembres] = useState([]);
  const [message, setMessage] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  // Chargement initial
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get('/members');
        if (!mounted) return;
        setMembres(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        if (error?.response?.status === 401) {
          setMessage('⛔ Session expirée. Veuillez vous reconnecter.');
          navigate('/connexion-utilisateur');
        } else {
          console.error('❌ Erreur chargement membres :', error);
          setMessage(error?.message || 'Erreur serveur');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Nettoyage du timer au démontage du composant
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Suppression (appelée seulement depuis la modale "Confirmer")
  const handleDelete = async memberId => {
    try {
      await api.delete(`/members/${memberId}`);
      setMembres(prev => prev.filter(membre => membre.member_id !== memberId));
      setMessage('✅ Membre supprimé avec succès.');

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Erreur suppression :', error);
      setMessage(
        error?.response?.data?.message || '❌ Erreur lors de la suppression.'
      );
    }
  };

  return (
    <section className="members-section" aria-labelledby="members-title">
      <RetourProfil />

      <Modal
        open={confirmId !== null}
        title="Confirmer la suppression"
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          await handleDelete(confirmId);
          setConfirmId(null);
        }}
        cancelText="Annuler"
        confirmText="Supprimer"
      >
        Cette action supprimera définitivement le membre sélectionné.
      </Modal>

      <h2 id="members-title">👤 Liste des Membres</h2>

      {message && (
        <p className="status" role="status" aria-live="polite">
          {message}
        </p>
      )}

      {membres.length > 0 ? (
        <ul className="members-list">
          {membres.map(membre => (
            <li key={membre.member_id} className="members-item">
              <article aria-label={`Membre ${membre.name}`}>
                <p>
                  <strong>{membre.name}</strong> — {membre.email}
                </p>

                <div className="actions">
                  <button
                    type="button"
                    className="remove btn btn--with-text"
                    onClick={() => setConfirmId(membre.member_id)}
                    title="Supprimer"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        !message && <p>Aucun membre trouvé.</p>
      )}
    </section>
  );
}

export default ListeMembres;