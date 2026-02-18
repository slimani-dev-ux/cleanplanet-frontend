// src/pages/ChoixConnexion.jsx
import { useNavigate } from 'react-router-dom';


// Page de choix du type de connexion (navigation vers connexions utilisateur ou membre)
function ChoixConnexion() {
  const navigate = useNavigate(); // Navigation programmatique

  return (
    // Conteneur principal de la page
    <div className="login-page">
      <h2>🔐 Choisissez votre type de connexion</h2>

      {/* Connexion “Utilisateur” */}
      <div>
        <button onClick={() => navigate('/connexion-utilisateur')}>
          👤 Connexion Utilisateur
        </button>
        <p>👤 Utilisateur : peut commenter les articles.</p>
      </div>

      {/* Connexion “Membre” */}
      <div>
        <button onClick={() => navigate('/connexion-membre')}>
          🛠️ Connexion Membre
        </button>
        <p>🛠️ Membre : peut publier et commenter des articles.</p>
      </div>
    </div>
  );
}

export default ChoixConnexion;
