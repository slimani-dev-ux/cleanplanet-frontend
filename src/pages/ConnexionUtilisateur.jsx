// src/pages/ConnexionUtilisateur.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ConnexionUtilisateur() {
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
      // 1) login -> le serveur pose le cookie httpOnly
      await api.post('/auth/login', {
        email: (email || '').trim().toLowerCase(),
        password: motDePasse,
      });

      // 2) récupérer l’info de session
      const { data: me } = await api.get('/auth/me');

      // 3) notifier le Header que la session a changé
      window.dispatchEvent(new Event('auth:updated'));

      // 4) rediriger selon le rôle
      const role = String(me?.role || '').toLowerCase();

      if (role === 'admin') {
        navigate('/profil-admin');
      } else {
        navigate('/profil-utilisateur');
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
    <section className="user-login" aria-labelledby="user-login-title">
      <h2 id="user-login-title">🔐 Connexion Utilisateur</h2>

      <form
        autoComplete="on"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={loading ? 'true' : 'false'}
      >
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Mot de passe</label>
        <input
          id="login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={motDePasse}
          onChange={e => setMotDePasse(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: 12,
            color: message.startsWith('❌') ? 'red' : 'green',
          }}
          aria-live="polite"
          role="status"
        >
          {message}
        </p>
      )}
    </section>
  );
}

export default ConnexionUtilisateur;