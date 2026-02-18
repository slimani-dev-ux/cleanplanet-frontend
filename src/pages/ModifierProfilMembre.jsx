// src/pages/ModifierProfilMembre.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, Loader2 } from 'lucide-react';

const ModifierProfilMembre = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    organization_id: '',
  });
  const [memberId, setMemberId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('black');

  // Bootstrap: session -> rôle member -> fetch profil
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await api.get('/auth/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        }); // cookie httpOnly
        const role = String(me.data?.role || '').toLowerCase();
        const id = me.data?.member_id ?? null;

        if (role !== 'member' || !id) {
          setMessage('⛔ Accès réservé au membre connecté.');
          setMessageColor('red');
          navigate('/connexion-membre', { replace: true });
          return;
        }

        setMemberId(id);

        const res = await api.get(`/members/${id}`, {
          validateStatus: s => (s >= 200 && s < 300) || s === 404,
        });
        if (!mounted) return;

        const m = res.data || {};
        setForm({
          name: m.name || '',
          email: m.email || '',
          organization_id: m.organization_id ?? '',
        });
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        const code = err?.response?.status;
        if (code === 401 || code === 403) {
          navigate('/connexion-membre', { replace: true });
          return;
        }
        setMessage('❌ Erreur de chargement');
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
    if (!memberId || saving) return;

    setSaving(true);
    setMessage('');
    try {
      const payload = {
        name: form.name,
        email: (form.email || '').trim().toLowerCase(),
        organization_id:
          form.organization_id === '' || form.organization_id === null
            ? null
            : Number(form.organization_id),
      };
      await api.put(`/members/${memberId}`, payload, {
        validateStatus: s => s >= 200 && s < 300,
      });

      setMessage('✅ Profil mis à jour avec succès.');
      setMessageColor('green');
      navigate('/profil-membre', { replace: true });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401 || code === 403) {
        navigate('/connexion-membre', { replace: true });
        return;
      }
      setMessage(
        err?.response?.data?.message || '❌ Erreur lors de la mise à jour.'
      );
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
    <div className="modify-member-profil" style={{ padding: 20 }}>
      <h3>✏️ Modifier mon profil</h3>

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
        <label htmlFor="member-name">Nom :</label>
        <input
          id="member-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="member-email">Email :</label>
        <input
          id="member-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="member-orgid">ID Organisation :</label>
        <input
          id="member-orgid"
          name="organization_id"
          type="number"
          value={form.organization_id ?? ''}
          onChange={handleChange}
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
};

export default ModifierProfilMembre;
