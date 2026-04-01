// src/pages/Accueil.jsx
import { Link } from 'react-router-dom';

// Page d’accueil : introduction + CTA vers la liste des articles
function Accueil() {
  return (
    // Conteneur principal de la page d’accueil
    <main className="home">
      {/* Overlay visuel (habillage géré par la CSS) */}
      <div className="overlay">
        {/* Bloc d’introduction (titre, slogan, description, CTA) */}
        <section className="intro">
          <h1>Bienvenue sur CleanPlanet 🌍</h1>
          <h2 className="slogan">Agir pour un futur plus vert 🌱</h2>
          <p>
            Notre mission est de sensibiliser aux enjeux environnementaux,
            partager des Articles utiles, et encourager l’action pour protéger
            notre planète.
          </p>
          {/* Navigation interne vers la liste publique des articles */}
          <Link to="/liste-articles">
            <button className="cta-button">Voir la liste des Articles</button>
          </Link>   
        </section>
      </div>
    </main>
  );
}

export default Accueil;
