// src/pages/ConnexionMembre.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ConnexionMembre() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    if (loading) return;

    setMessage('');
    setLoading(true);

    try {
      // 1) Login membre : le backend pose le cookie HttpOnly
      await api.post(
        '/members/login',
        {
          email: (email || '').trim().toLowerCase(),
          password: motDePasse,
        },
        { validateStatus: s => s >= 200 && s < 300 }
      );

      // 2) Lire la session via le cookie
      const { data: me } = await api.get('/auth/me', {
        validateStatus: s => (s >= 200 && s < 300) || s === 401,
      });

      const role = String(me?.role || '').toLowerCase();

      // 3) Rediriger selon le rôle
      if (role === 'member') {
        navigate('/profil-membre', { replace: true });
      } else if (role === 'admin') {
        navigate('/profil-admin', { replace: true });
      } else {
        navigate('/profil-utilisateur', { replace: true });
      }
    } catch (err) {
      setMessage(
        err?.response?.data?.message || '❌ Email ou mot de passe incorrect'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="member-login" aria-labelledby="member-login-title">
      <h2 id="member-login-title">🔐 Connexion Membre</h2>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={loading ? 'true' : 'false'}
      >
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Mot de passe</label>
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={e => setMotDePasse(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 12 }} role="status" aria-live="polite">
          {message}
        </p>
      )}
    </section>
  );
}

export default ConnexionMembre;