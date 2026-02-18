// src/pages/AjouterOrganisation.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import RetourProfil from '../components/RetourProfil';

function AjouterOrganisation() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
  });
  const [message, setMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setStatusType('info');
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post('/organizations', formData, {
        validateStatus: s => s >= 200 && s < 300,
      });
      setMessage('✅ Organisation ajoutée avec succès');
      setStatusType('success');
      // Redirection immédiate, sans délai artificiel
      navigate('/liste-organisations', { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Erreur lors de l’ajout');
      setStatusType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="add-an-organization">
      <RetourProfil />
      <h2>
        <span aria-hidden="true">➕</span> Ajouter une organisation
      </h2>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`form-status form-status--${statusType}`}>
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="org-form"
        aria-busy={submitting ? 'true' : 'false'}>
        <fieldset className="fieldset">
          <legend>Informations de l’organisation</legend>

          <div className="form-row form-row--full">
            <label htmlFor="org-name">Nom de l'organisation</label>
            <input
              id="org-name"
              name="name"
              type="text"
              placeholder="Nom de l'organisation"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row form-row--full">
            <label htmlFor="org-address">Adresse</label>
            <input
              id="org-address"
              name="address"
              type="text"
              placeholder="Adresse"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="org-city">Ville</label>
            <input
              id="org-city"
              name="city"
              type="text"
              placeholder="Ville"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="org-postal">Code postal</label>
            <input
              id="org-postal"
              name="postal_code"
              type="text"
              placeholder="Code postal"
              value={formData.postal_code}
              onChange={handleChange}
              required
            />
          </div>
        </fieldset>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          ✅ Ajouter
        </button>
      </form>
    </main>
  );
}

export default AjouterOrganisation;
