// src/components/layout/Footer.jsx
import { useState } from 'react';

// Pied de page : formulaire (statique) + liens vers réseaux sociaux
function Footer() {
  const [status, setStatus] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    // Ici on ferait l'appel API si nécessaire, puis :
    setStatus('Votre message a bien été envoyé.');
    e.currentTarget.reset();
    // Nettoyage du message après 4s (optionnel)
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <footer className="footer">
      <form className="contact-form" onSubmit={handleSubmit}>
        <h3>Contactez-nous</h3>

        <label className="sr-only" htmlFor="contact-name">
          Votre nom
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          placeholder="Votre nom"
          autoComplete="name"
          required
          aria-required="true"
        />

        <label className="sr-only" htmlFor="contact-email">
          Votre e-mail
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="Votre e-mail"
          autoComplete="email"
          required
          aria-required="true"
          inputMode="email"
        />

        <label className="sr-only" htmlFor="contact-message">
          Votre message
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Votre message"
          rows={4}
          required
          aria-required="true"
        />

        <button type="submit" className="btn-primary">
          Envoyer
        </button>

        {/* Zone de feedback accessible */}
        <p
          className="form-status form-status--success"
          role="status"
          aria-live="polite">
          {status}
        </p>
      </form>

      <nav className="social-icons" aria-label="Réseaux sociaux">
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter">
          <i className="fab fa-twitter"></i>
        </a>
        <a
          href="https://facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook">
          <i className="fab fa-facebook"></i>
        </a>
        <a
          href="https://instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram">
          <i className="fab fa-instagram"></i>
        </a>
      </nav>
    </footer>
  );
}

export default Footer;
