import React from 'react';
import { Link } from 'react-router-dom';

/* Page de confirmation après modification d’organisation */
function OrganisationModifiee() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>✅ Organisation modifiée avec succès</h2>

      <Link to="/liste-organisations">
        <button style={{ margin: '20px' }}>⬅️ Retour à la liste</button>
      </Link>
    </div>
  );
}

export default OrganisationModifiee;
