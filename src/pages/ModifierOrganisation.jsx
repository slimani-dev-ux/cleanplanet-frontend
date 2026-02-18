// src/pages/ModifierOrganisation.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function ModifierOrganisation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState({
    name: '',
    address: '',
    postal_code: '',
    city: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 1) Vérifier la session via /auth/me, forcer admin, puis charger l’orga
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        // Session depuis cookie (withCredentials déjà true dans api)
        const me = await api.get('/auth/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        });
        const role = String(me.data?.role || '').toLowerCase();
        const isAdmin = role === 'admin';
        if (!isAdmin) {
          navigate('/connexion'); // protection front minimale
          return;
        }

        // Charger l’organisation (route protégée côté backend)
        const res = await api.get(`/organizations/${id}`, {
          validateStatus: s => (s >= 200 && s < 300) || s === 404,
        });
        if (!mounted) return;

        const o = res.data || {};
        setOrg({
          name: o.name || '',
          address: o.address || '',
          postal_code: o.postal_code || '',
          city: o.city || '',
        });
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        const code = err?.response?.status;
        if (code === 401 || code === 403) {
          navigate('/connexion');
          return;
        }
        setMessage('❌ Erreur de chargement');
        setLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setOrg(prev => ({ ...prev, [name]: value }));
  };

  // 2) Sauvegarde sans Authorization header (le cookie suffit)
  const handleSubmit = async e => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage('');
    try {
      await api.put(`/organizations/${id}`, org, {
        validateStatus: s => s >= 200 && s < 300,
      });
      // Navigation directe (la page de “confirmation” peut être optionnelle)
      navigate('/liste-organisations', { replace: true });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401 || code === 403) {
        navigate('/connexion');
        return;
      }
      setMessage(
        err?.response?.data?.message || '❌ Erreur lors de la modification'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }} role="status" aria-busy="true">
        Chargement…
      </div>
    );
  }

  return (
    <div className='modify-organization' style={{ padding: 20 }}>
      <h2>✏️ Modifier l’organisation</h2>

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={saving ? 'true' : 'false'}>
        <div>
          <label htmlFor="org-name">Nom</label>
          <input
            id="org-name"
            type="text"
            name="name"
            value={org.name}
            onChange={handleChange}
            placeholder="Nom"
            required
          />
        </div>
        <div>
          <label htmlFor="org-address">Adresse</label>
          <input
            id="org-address"
            type="text"
            name="address"
            value={org.address}
            onChange={handleChange}
            placeholder="Adresse"
            required
          />
        </div>
        <div>
          <label htmlFor="org-postal">Code postal</label>
          <input
            id="org-postal"
            type="text"
            name="postal_code"
            value={org.postal_code}
            onChange={handleChange}
            placeholder="Code postal"
            required
          />
        </div>
        <div>
          <label htmlFor="org-city">Ville</label>
          <input
            id="org-city"
            type="text"
            name="city"
            value={org.city}
            onChange={handleChange}
            placeholder="Ville"
            required
          />
        </div>
        <button type="submit" disabled={saving}>
          {saving ? 'Enregistrement…' : '💾 Enregistrer'}
        </button>
      </form>
    </div>
  );
}

export default ModifierOrganisation;
