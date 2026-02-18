// src/App.js
// Routing client avec React Router v6
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages & écrans
import Accueil from './pages/Accueil';
import Inscription from './pages/Inscription';
import ConnexionMembre from './pages/ConnexionMembre';
import ConnexionUtilisateur from './pages/ConnexionUtilisateur';
import DetailArticle from './components/DetailArticle';
import ListeArticles from './pages/ListeArticles';
import ModifierArticle from './components/ModifierArticle';
import AjouterArticle from './components/AjouterArticle';
import Layout from './components/layout/Layout';
import ProfilUtilisateur from './pages/ProfilUtilisateur';
import ProfilMembre from './pages/ProfilMembre';
import ChoixConnexion from './pages/ChoixConnexion';
import ModifierProfilMembre from './pages/ModifierProfilMembre';
import ModifierProfilUtilisateur from './pages/ModifierProfilUtilisateur';
import ListeMembres from './pages/ListeMembres';
import ListeUtilisateurs from './pages/ListeUtilisateurs';
import ListeOrganisations from './pages/ListeOrganisations';
import AjouterOrganisation from './pages/AjouterOrganisation';
import OrganisationModifiee from './pages/OrganisationModifiee';
import ModifierOrganisation from './pages/ModifierOrganisation';
import ProfilAdmin from './pages/ProfilAdmin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route parent avec Layout commun (Header/Footer/Outlet) */}
        <Route path="/" element={<Layout />}>
          {/* Accueil & Auth */}
          <Route index element={<Accueil />} />
          <Route path="/connexion" element={<ChoixConnexion />} />
          <Route path="/connexion-utilisateur" element={<ConnexionUtilisateur />} />
          <Route path="/connexion-membre" element={<ConnexionMembre />} />
          <Route path="/inscription" element={<Inscription />} />

          {/* Articles */}
          <Route path="/liste-articles" element={<ListeArticles mode="public" />} />
          <Route path="/admin/liste-articles" element={<ListeArticles mode="admin" />} />
          <Route path="/membre/liste-articles" element={<ListeArticles mode="member" />} />
          <Route path="/article/:id" element={<DetailArticle />} />
          <Route path="/ajouter" element={<AjouterArticle />} />
          <Route path="/modifier-article/:id" element={<ModifierArticle />} />

          {/* Profils */}
          <Route path="profil-admin" element={<ProfilAdmin />} />
          <Route path="/profil-utilisateur" element={<ProfilUtilisateur />} />
          <Route path="/profil-utilisateur/liste-articles" element={<ListeArticles />} />
          <Route path="/profil-membre" element={<ProfilMembre />} />
          <Route path="/modifier-profil-utilisateur" element={<ModifierProfilUtilisateur />} />
          <Route path="/modifier-profil-membre" element={<ModifierProfilMembre />} />

          {/* Organisations */}
          <Route path="/ajouter-organisation" element={<AjouterOrganisation />} />
          <Route path="/organisation-modifiee" element={<OrganisationModifiee />} />
          <Route path="/modifier-organisation/:id" element={<ModifierOrganisation />} />

          {/* Administration */}
          <Route path="/liste-membres" element={<ListeMembres />} />
          <Route path="/liste-utilisateurs" element={<ListeUtilisateurs />} />
          <Route path="/liste-organisations" element={<ListeOrganisations />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
