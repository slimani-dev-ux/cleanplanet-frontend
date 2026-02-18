// src/pages/ModifierProfilUtilisateur.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, Loader2 } from 'lucide-react';

function ModifierProfilUtilisateur() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('black');

  // Bootstrap session -> récupérer l'id + préremplir depuis /auth/me
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: me } = await api.get('/auth/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        }); // cookie httpOnly
        const role = String(me?.role || '').toLowerCase();
        const id = me?.user_id ?? null;

        if (!id || (role !== 'user' && role !== 'admin')) {
          navigate('/connexion');
          return;
        }

        if (!mounted) return;
        setUserId(id);
        setForm({
          name: me?.name || '',
          email: me?.email || '',
        });
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        const code = err?.response?.status;
        if (code === 401 || code === 403) {
          navigate('/connexion');
          return;
        }
        setMessage('❌ Erreur de chargement.');
        setMessageColor('red');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userId || saving) return;

    setSaving(true);
    setMessage('');
    try {
      await api.put(
        `/users/${userId}`,
        {
          name: form.name,
          email: (form.email || '').trim().toLowerCase(),
        },
        { validateStatus: s => s >= 200 && s < 300 }
      );
      setMessage('✅ Informations mises à jour');
      setMessageColor('green');
      navigate('/profil-utilisateur', { replace: true });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401 || code === 403) {
        navigate('/connexion');
        return;
      }
      setMessage(err?.response?.data?.message || '❌ Erreur serveur');
      setMessageColor('red');
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
    <div className="modify-user-profil" style={{ padding: 20 }}>
      <h2>✏️ Modifier mes informations</h2>

      {message && (
        <p
          style={{ color: messageColor, fontWeight: 'bold' }}
          role="status"
          aria-live="polite">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={saving ? 'true' : 'false'}>
        <label htmlFor="user-name">Nom</label>
        <input
          id="user-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Nom"
          required
        />

        <label htmlFor="user-email">Email</label>
        <input
          id="user-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          aria-label="Enregistrer"
          title="Enregistrer">
          {saving ? (
            <>
              <Loader2 className="icon spin" aria-hidden="true" />
              <span className="sr-only">Enregistrement…</span>
            </>
          ) : (
            <>
              <Save className="icon" aria-hidden="true" />
              <span className="sr-only">Enregistrer</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ModifierProfilUtilisateur;
