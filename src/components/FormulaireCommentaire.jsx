// src/components/FormulaireCommentaire.jsx
import { useState, useMemo } from 'react';
import api from '../api';
import { Send, Loader2 } from 'lucide-react';

// Formulaire de commentaire (POST /articles/:articleId/comments)
function FormulaireCommentaire({
  articleId,
  onCommentAdded,
  onAjouterCommentaireAdded,
}) {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // Choix du callback effectif (nouveau nom prioritaire)
  const handleAfterAdd = onCommentAdded ?? onAjouterCommentaireAdded;
  const isEmpty = useMemo(() => !String(content).trim(), [content]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    const trimmed = String(content || '').trim();

    if (!trimmed) {
      setError('⚠️ Veuillez entrer un commentaire.');
      return;
    }

    try {
      setSending(true);
      await api.post(`/articles/${articleId}/comments`, { content: trimmed });
      setContent('');
      setError('');
      setMessage('✅ Commentaire publié !');
      handleAfterAdd?.();
    } catch (error) {
      console.error('❌ Erreur envoi commentaire :', error);
      setMessage('');
      setError('❌ Erreur lors de l’envoi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="comment-form"
      aria-busy={sending ? 'true' : 'false'}>
      <label htmlFor="commentaire">Votre commentaire</label>

      <textarea
        id="commentaire"
        name="commentaire"
        className="comment-textarea"
        rows={5}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="✍️ Écris ton commentaire…"
        required
        aria-required="true"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'commentaire-error' : undefined}
      />

      <button
        type="submit"
        disabled={sending || isEmpty}
        className="btn btn-primary">
        {sending ? (
          <>
            <Loader2 className="icon spin" aria-hidden="true" />
            <span>Publication…</span>
          </>
        ) : (
          <>
            <Send className="icon" aria-hidden="true" />
            <span>Publier</span>
          </>
        )}
      </button>

      <p aria-live="polite" role="status" className="sr-only">
        {sending ? 'Publication du commentaire en cours' : ''}
      </p>

      {error && (
        <p
          id="commentaire-error"
          className="status"
          role="alert"
          aria-live="polite">
          {error}
        </p>
      )}

      {message && (
        <p className="status" role="status" aria-live="polite">
          {message}
        </p>
      )}
    </form>
  );
}

export default FormulaireCommentaire;
