// src/components/AjouterArticle.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  normalizeTitle,
  normalizeDescription,
  hasMeaningfulChars,
} from '../utils/validators';

// Ajout d’article (multipart) avec redirection selon le rôle retourné par /auth/me
export default function AjouterArticle() {
  const navigate = useNavigate();

  // Champs contrôlés du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage('');
    setTitleError('');
    setDescError('');

    // 1) Validation côté client (mêmes règles que le contrôleur)
    const t = normalizeTitle(title);
    const d = normalizeDescription(description);
    if (!t || !hasMeaningfulChars(t)) {
      setMessage('Titre requis (au moins un caractère alphanumérique).');
      setSubmitting(false);
      return;
    }
    if (!d || d.replace(/\s/g, '').length < 5 || !hasMeaningfulChars(d)) {
      setMessage('Description requise (≥ 5 caractères).');
      setSubmitting(false);
      return;
    }
    try {
      const formData = new FormData();
      // 2) On envoie les valeurs normalisées
      formData.append('title', t);
      formData.append('description', d);
      if (image) formData.append('image', image);

      // POST /api/articles — cookie httpOnly via withCredentials=true (défini dans api)
      await api.post('/articles', formData, {
        // ne pas fixer Content-Type pour laisser le navigateur gérer le boundary
        validateStatus: s => s >= 200 && s < 300,
      });

      setMessage('✅ Article publié avec succès');

      // Demande au serveur qui je suis (rôle dans le cookie)
      try {
        const { data: me } = await api.get('/auth/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        }); // { role, ... }
        const role = String(me?.role || '').toLowerCase();

        if (role === 'member') {
          navigate('/profil-membre', { replace: true });
        } else if (role === 'admin') {
          navigate('/admin/liste-articles', { replace: true });
        } else {
          // (cas improbable ici)
          navigate('/', { replace: true });
        }
      } catch {
        // si /auth/me échoue, on tente la destination membre (composant protégé renverra vers login si besoin)
        navigate('/profil-membre', { replace: true });
      }

      // reset du formulaire (optionnel)
      setTitle('');
      setDescription('');
      setImage(null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setMessage('⛔ Session invalide. Veuillez vous reconnecter.');
        navigate('/connexion-membre', { replace: true });
      } else {
        const srvMsg = err?.response?.data?.message || '';
        // refléter précisément les validations serveur si 400
        if (status === 400) {
          if (/titre/i.test(srvMsg)) setTitleError(srvMsg);
          if (/description/i.test(srvMsg)) setDescError(srvMsg);
          setMessage(
            srvMsg ||
              '❌ Données invalides (vérifiez le titre et la description).'
          );
        } else {
          setMessage('❌ Erreur lors de la publication');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-article">
      <h2>Ajouter un article</h2>

      <form
        onSubmit={onSubmit}
        noValidate
        aria-busy={submitting ? 'true' : 'false'}
        encType="multipart/form-data">
        <label htmlFor="article-title">Titre</label>
        <input
          id="article-title"
          className="article-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          aria-invalid={titleError ? 'true' : 'false'}
          aria-describedby={titleError ? 'article-title-error' : undefined}
        />
        {titleError && (
          <p
            id="article-title-error"
            role="status"
            aria-live="polite"
            style={{ marginTop: 4 }}>
            {titleError}
          </p>
        )}
        <label htmlFor="article-description">Description</label>
        <textarea
          id="article-description"
          className="article-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          required
          aria-invalid={descError ? 'true' : 'false'}
          aria-describedby={descError ? 'article-description-error' : undefined}
        />
        {descError && (
          <p
            id="article-description-error"
            role="status"
            aria-live="polite"
            style={{ marginTop: 4 }}>
            {descError}
          </p>
        )}
        <label htmlFor="article-image">Image (optionnelle)</label>
        <input
          id="article-image"
          className="article-image"
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] ?? null)}
        />

        <button className="article-submit" type="submit" disabled={submitting}>
          {submitting ? 'Publication…' : '➕ Publier'}
        </button>
        <p aria-live="polite" role="status" className="sr-only">
          {submitting ? 'Publication en cours' : ''}
        </p>
      </form>

      {message && (
        <p style={{ marginTop: 12 }} aria-live="polite" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
