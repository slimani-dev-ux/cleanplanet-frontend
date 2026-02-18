// src/components/ModifierArticle.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  normalizeTitle,
  normalizeDescription,
  hasMeaningfulChars,
} from '../utils/validators';

// Édition d’un article existant (chargement + mise à jour avec image optionnelle)
export default function ModifierArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Chargement de l’article
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await api.get(`/articles/${id}`, {
          validateStatus: s => (s >= 200 && s < 300) || s === 404,
        });
        if (!isMounted) return;

        if (response.status === 404) {
          setMessage('❌ Article introuvable');
          return;
        }
        setTitle(response.data?.title ?? '');
        setDescription(response.data?.description ?? '');
      } catch (error) {
        console.error('Erreur chargement article :', error);
        if (isMounted) setMessage('❌ Erreur chargement article');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Soumission de la mise à jour
  const onSubmit = async e => {
    e.preventDefault();
    setMessage('');

    const t = normalizeTitle(title);
    const d = normalizeDescription(description);

    if (!t || !hasMeaningfulChars(t)) {
      setMessage('Le titre est requis (au moins un caractère alphanumérique).');
      return;
    }
    if (!d || d.replace(/\s/g, '').length < 5 || !hasMeaningfulChars(d)) {
      setMessage(
        'La description doit contenir au moins 5 caractères significatifs.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', t);
      formData.append('description', d);
      if (image) formData.append('image', image);

      await api.put(`/articles/${id}`, formData, {
        validateStatus: s => s >= 200 && s < 300,
      });

      setMessage('✅ Article mis à jour avec succès !');

      // Redirection selon rôle
      try {
        const { data: me } = await api.get('/auth/me', {
          validateStatus: s => (s >= 200 && s < 300) || s === 401,
        });
        const role = String(me?.role || '').toLowerCase();
        if (role === 'admin')
          navigate('/admin/liste-articles', { replace: true });
        else if (role === 'member')
          navigate('/profil-membre', { replace: true });
        else navigate('/', { replace: true });
      } catch {
        navigate('/', { replace: true });
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400) {
        setMessage(
          error?.response?.data?.message ||
            '❌ Données invalides (vérifiez le titre/description).'
        );
      } else if (status === 401 || status === 403) {
        setMessage('⛔ Session invalide. Veuillez vous reconnecter.');
        navigate('/connexion-membre', { replace: true });
      } else {
        setMessage('❌ Erreur lors de la mise à jour');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modify-article">
      <h2>Modifier l’article</h2>

      <form
        className="form-modify-art"
        onSubmit={onSubmit}
        noValidate
        aria-busy={submitting ? 'true' : 'false'}>
        <label htmlFor="edit-title">Titre</label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          disabled={submitting}
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          required
          disabled={submitting}
        />

        <label htmlFor="image">Image (optionnelle)</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] ?? null)}
          style={{ display: 'block', margin: '8px 0' }}
          disabled={submitting}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement…' : '✅ Enregistrer les modifications'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 12 }} aria-live="polite" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
