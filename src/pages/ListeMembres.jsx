// src/pages/ListeMembres.jsx
// Page admin : liste des membres — chargement initial, suppression, et feedback utilisateur.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RetourProfil from '../components/RetourProfil';
import Modal from '../components/Modal';
import api from '../api';
import { Trash2 } from 'lucide-react';

function ListeMembres() {
  const [membres, setMembres] = useState([]);
  const [message, setMessage] = useState('');
  const [confirmId, setConfirmId] = useState(null); // ← id en attente de confirmation
  const navigate = useNavigate();

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

  // Suppression (appelée seulement depuis la modale "Confirmer")
  const handleDelete = async memberId => {
    try {
      await api.delete(`/members/${memberId}`);
      setMembres(prev => prev.filter(m => m.member_id !== memberId));
      setMessage('✅ Membre supprimé avec succès.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erreur suppression :', error);
      setMessage(
        error?.response?.data?.message || '❌ Erreur lors de la suppression.'
      );
    }
  };

  return (
    <div className="members-section">
      <RetourProfil />
      {/* Modale de confirmation : un seul set de boutons (ceux du Modal) */}
      <Modal
        open={confirmId !== null}
        title="Confirmation"
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          await handleDelete(confirmId);
          setConfirmId(null);
        }}
        cancelText="Annuler"
        confirmText="Confirmer">
        <p>Supprimer ce membre ?</p>
      </Modal>
      <h2>👤 Liste des Membres</h2>

      {message && <p className="status">{message}</p>}

      {membres.length > 0 ? (
        <ul className="members-list">
          {membres.map(membre => (
            <li key={membre.member_id} className="members-item">
              <strong>{membre.name}</strong> — {membre.email}
              <button
                className="remove"
                onClick={() => setConfirmId(membre.member_id)}
                aria-label="Supprimer"
                title="Supprimer">
                <Trash2 size={18} aria-hidden="true" />{' '}
                <span className="sr-only">Supprimer</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !message && <p>Aucun membre trouvé.</p>
      )}
    </div>
  );
}

export default ListeMembres;
