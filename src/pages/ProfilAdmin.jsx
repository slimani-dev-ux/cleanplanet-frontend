// src/pages/ProfilAdmin.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function ProfilAdmin() {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  // Vérifie la session via le cookie (GET /auth/me) et contrôle le rôle admin
  useEffect(() => {
    let mounted = true;
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!mounted) return;
        const role = String(data?.role || '').toLowerCase();
        if (role !== 'admin') {
          alert('Accès réservé aux administrateurs.');
          navigate('/');
          return;
        }
        // data = { role, is_admin, user_id, email, name, ... }
        setAdmin({
          name: data.name,
          email: data.email,
          role: data.role,
        });
      })
      .catch(() => {
        // Non authentifié → page de login
        navigate('/connexion-utilisateur');
      });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <section className="admin-profile-section">
      <h2>👑 Profil Administrateur</h2>

      {admin ? (
        <>
          <p>
            <strong>Nom :</strong> {admin.name}
          </p>
          <p>
            <strong>Email :</strong> {admin.email}
          </p>
          <p>
            <strong>Rôle :</strong> {admin.role}
          </p>

          <hr className="section-divider" />

          <h3>🔧 Outils d’administration</h3>
          <ul className="tools-list">
            <li className="tools-item">
              <Link to="/liste-utilisateurs" className="button-link">
                👥 Gérer les utilisateurs
              </Link>
            </li>
            <li className="tools-item">
              <Link to="/liste-membres" className="button-link">
                👤 Gérer les membres
              </Link>
            </li>
            <li className="tools-item">
              <Link to="/liste-organisations" className="button-link">
                🏢 Gérer les organisations
              </Link>
            </li>
            <li className="tools-item">
              <Link to="/admin/liste-articles" className="button-link">
                📰 Voir les publications
              </Link>
            </li>
          </ul>
        </>
      ) : (
        <p>Chargement des informations…</p>
      )}
    </section>
  );
}

export default ProfilAdmin;
