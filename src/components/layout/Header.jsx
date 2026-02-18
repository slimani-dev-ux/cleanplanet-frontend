// src/components/layout/Header.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import logo from '../../assets/logo1.png';

function Header() {
  const [session, setSession] = useState({
    isAuthenticated: false,
    isAdmin: false,
    isMember: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      const role = String(data?.role || '').toLowerCase();
      const authed = !!role;

      // Cette fonction permet de mettre à jour les flags de session (isAuthenticated, isAdmin, isMember) d’après la réponse de /auth/me, sinon réinitialise tout à faux en cas d’échec.

      setSession({
        isAuthenticated: authed,
        isAdmin: authed && (role === 'admin' || data.is_admin === true),
        isMember: authed && role === 'member',
      });
    } catch {
      setSession({ isAuthenticated: false, isAdmin: false, isMember: false });
    }
  }, []);

  // 1) Au montage → synchronise l’état avec le cookie
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // 2) À chaque changement de page (key change) → revalide la session
  useEffect(() => {
    refreshSession();
  }, [location.key, refreshSession]);

  // 3) Écoute l’événement global "auth:updated"
  useEffect(() => {
    const handler = () => refreshSession();
    window.addEventListener('auth:updated', handler);
    return () => window.removeEventListener('auth:updated', handler);
  }, [refreshSession]);

  const handleLogout = async e => {
    e?.preventDefault?.();
    try {
      await api.post('/auth/logout');
    } catch {}

    // Nettoyage "héritage" éventuel
    localStorage.removeItem('token');
    localStorage.removeItem('token_membre');
    localStorage.removeItem('user');
    localStorage.removeItem('membre');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_membre');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('membre');

    // Met immédiatement l'UI à jour (optimiste)
    setSession({ isAuthenticated: false, isAdmin: false, isMember: false });

    // Informe le reste de l’app + resynchronise en lisant /auth/me
    window.dispatchEvent(new Event('auth:updated'));
    await refreshSession();

    // Retour accueil
    navigate('/', { replace: true });
  };

  return (
    <header className="header">
      <div className="header-overlay">
        <div className="logo">
          <img src={logo} alt="CleanPlanet — logo" />
          <span>CleanPlanet</span>
        </div>

        <nav className="nav-links" aria-label="Navigation principale">
          <Link to="/">Accueil</Link>
          {/* Admin → envoie un state { mode: 'admin' } en allant vers Articles */}
          {session.isAdmin ? (
            <Link to="/liste-articles" state={{ mode: 'admin' }}>
              Articles
            </Link>
          ) : (
            <Link to="/liste-articles">Articles</Link>
          )}

          {session.isAuthenticated ? (
            <>
              {session.isAdmin && <Link to="/inscription">inscription</Link>}

              {session.isMember && <Link to="/profil-membre">Mon profil</Link>}
              {!session.isMember && !session.isAdmin && (
                <Link to="/profil-utilisateur">Mon profil</Link>
              )}
              <Link to="/" onClick={handleLogout} className="logout-link">
                Déconnexion
              </Link>

              {/* <Link to="/" onClick={handleLogout}>
                Déconnexion
              </Link> */}
            </>
          ) : (
            <>
              <Link to="/inscription">Inscription</Link>
              <Link to="/connexion">Connexion</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
