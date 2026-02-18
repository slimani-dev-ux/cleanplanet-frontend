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
  const [sending, setSending] = useState(false);

  // Choix du callback effectif (nouveau nom prioritaire)
  const handleAfterAdd = onCommentAdded ?? onAjouterCommentaireAdded;
  const isEmpty = useMemo(() => !String(content).trim(), [content]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    const trimmed = String(content || '').trim();
    if (!trimmed) {
      setMessage('⚠️ Veuillez entrer un commentaire.');
      return;
    }

    try {
      setSending(true);
      await api.post(`/articles/${articleId}/comments`, { content: trimmed });
      setContent('');
      setMessage('✅ Commentaire publié !');
      handleAfterAdd?.();
    } catch (error) {
      console.error('❌ Erreur envoi commentaire :', error);
      setMessage('❌ Erreur lors de l’envoi.');
    } finally {
      setSending(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="comment-form">
      <label htmlFor="commentaire">Votre commentaire</label>
      <textarea
        id="commentaire"
        className="comment-textarea"
        rows={5} // ← hauteur de base (augmentable)
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="✍️ Écris ton commentaire…"
        required
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

      <p aria-live="polite" className="sr-only">
        {sending ? 'Publication du commentaire en cours' : ''}
      </p>

      {message && <p className="status">{message}</p>}
    </form>
  );
}

export default FormulaireCommentaire;
