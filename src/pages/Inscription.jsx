// src/pages/Inscription.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Inscription() {
  const navigate = useNavigate();

  // Données
  const [organizations, setOrganizations] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // États de chargement
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);

  // Formulaires
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    password: '',
    organization_id: '',
  });

  // 1) Qui suis-je ? (via cookie httpOnly)
  useEffect(() => {
    let mounted = true;
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!mounted) return;
        const role = String(data?.role || '').toLowerCase();
        setIsAdmin(role === 'admin' || data?.is_admin === true);
      })
      .catch(() => {
        if (mounted) setIsAdmin(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2) Si admin, charger les organisations
  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    api
      .get('/organizations')
      .then(res => {
        if (!mounted) return;
        setOrganizations(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error('Erreur chargement organisations :', err);
        setOrganizations([]);
      });
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  // 3) Inscription utilisateur (publique)
  const handleUserSubmit = async e => {
    e.preventDefault();
    if (loadingUser) return;
    setLoadingUser(true);
    try {
      await api.post('/auth/register', {
        name: String(userForm.name || '').trim(),
        email: String(userForm.email || '')
          .trim()
          .toLowerCase(),
        password: userForm.password,
      });
      alert('✅ Utilisateur enregistré !');
      navigate('/connexion');
    } catch (error) {
      console.error('Erreur inscription utilisateur :', error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        '❌ Erreur inscription utilisateur';
      alert(message);
    } finally {
      setLoadingUser(false);
    }
  };

  // 4) Inscription membre (protégé admin)
  const handleMemberSubmit = async e => {
    e.preventDefault();
    if (loadingMember) return;
    setLoadingMember(true);
    try {
      await api.post('/members/register', {
        name: String(memberForm.name || '').trim(),
        email: String(memberForm.email || '')
          .trim()
          .toLowerCase(),
        password: memberForm.password,
        organization_id: Number(memberForm.organization_id) || null,
      });
      alert('✅ Membre enregistré !');
      navigate('/profil-admin');
    } catch (error) {
      console.error('Erreur inscription membre :', error);
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        '❌ Erreur inscription membre';
      if (status === 401 || status === 403) {
        alert(
          'Session invalide ou droits insuffisants. Merci de vous reconnecter.'
        );
        navigate('/connexion');
        return;
      }
      alert(message);
    } finally {
      setLoadingMember(false);
    }
  };

  return (
    <div className="register-page">
      <h2>Inscription Utilisateur</h2>
      <form autoComplete="on" onSubmit={handleUserSubmit} noValidate>
        <label htmlFor="reg-name">Nom</label>
        <input
          id="reg-name"
          type="text"
          name="name"
          autoComplete="name"
          value={userForm.name}
          onChange={e => setUserForm({ ...userForm, name: e.target.value })}
          required
        />

        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={userForm.email}
          onChange={e => setUserForm({ ...userForm, email: e.target.value })}
          required
        />

        <label htmlFor="reg-password">Mot de passe</label>
        <input
          id="reg-password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={userForm.password}
          onChange={e => setUserForm({ ...userForm, password: e.target.value })}
          required
        />

        <button type="submit" disabled={loadingUser}>
          {loadingUser ? 'Création…' : 'Créer un compte utilisateur'}
        </button>
      </form>

 

      {isAdmin && (
        <div className="isAdmin" style={{ marginTop: 24 }}>
          <h2>Inscription Membre</h2>

          <form onSubmit={handleMemberSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="member-name">Nom</label>
              <input
                id="member-name"
                name="name"
                type="text"
                value={memberForm.name}
                onChange={e =>
                  setMemberForm({ ...memberForm, name: e.target.value })
                }
                autoComplete="name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="member-org">Organisation</label>
              <select
                id="member-org"
                name="organization_id"
                value={memberForm.organization_id}
                onChange={e =>
                  setMemberForm({
                    ...memberForm,
                    organization_id: Number(e.target.value),
                  })
                }
                required>
                <option value="">Choisir une organisation</option>
                {organizations.map(org => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="member-email">Email</label>
              <input
                id="member-email"
                name="email"
                type="email"
                value={memberForm.email}
                onChange={e =>
                  setMemberForm({ ...memberForm, email: e.target.value })
                }
                autoComplete="username"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="member-password">Mot de passe</label>
              <input
                id="member-password"
                name="password"
                type="password"
                value={memberForm.password}
                onChange={e =>
                  setMemberForm({ ...memberForm, password: e.target.value })
                }
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingMember || !memberForm.organization_id}>
              {loadingMember ? 'Création…' : 'Créer un compte membre'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Inscription;
