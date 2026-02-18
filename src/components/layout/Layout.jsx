// src/components/layout/Layout.jsx
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

// Layout global : header commun, contenu des routes via <Outlet/>, footer commun.
function Layout() {
  return (
    <>
      <Header />
      <main className="main-container">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default Layout;
