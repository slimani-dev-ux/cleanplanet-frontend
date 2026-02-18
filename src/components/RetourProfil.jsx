// src/components/RetourProfil.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

/**
 * Bouton "Retour au profil" universel.
 * - Priorité: prop `to` > location.state.mode > /auth/me > fallback
 */
export default function RetourProfil({
  to, // ex: "/profil-admin". Si fourni, on l'utilise directement.
  label = '← Retour au profil',
  fallback = '/', // où aller si non authentifié / rôle inconnu
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dest, setDest] = useState(to || null);

  useEffect(() => {
    if (to) return; // destination imposée par la prop

    // 1) Si la page a passé un "mode" via navigate(..., { state: { mode } })
    const mode = location.state?.mode;
    if (mode === 'admin') return setDest('/profil-admin');
    if (mode === 'member') return setDest('/profil-membre');
    if (mode === 'user') return setDest('/profil-utilisateur');

    // 2) Sinon, on demande au backend (cookie httpOnly) qui nous sommes
    let mounted = true;
    api
      .get('/auth/me')
      .then(res => {
        if (!mounted) return;
        const role = String(res.data?.role || '').toLowerCase();
        if (role === 'admin') setDest('/profil-admin');
        else if (role === 'member') setDest('/profil-membre');
        else if (role === 'user') setDest('/profil-utilisateur');
        else setDest(fallback);
      })
      .catch(() => mounted && setDest(fallback));
    return () => {
      mounted = false;
    };
  }, [to, location.state, fallback]);

  return (
    <button
      type="button"
      className="retour-profil-btn"
      onClick={() => navigate(dest || fallback)}
      disabled={!dest}>
      {label}
    </button>
  );
}
