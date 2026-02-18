// src/components/ListeCommentaires.jsx
import { useEffect, useState } from 'react';
import api from '../api';

// Liste des commentaires d’un article (lecture seule)
function ListeCommentaires({ articleId }) {
  const [commentaires, setCommentaires] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Chargement des commentaires…');

  useEffect(() => {
    let mounted = true;
    setStatusMsg('Chargement des commentaires…');

    api
      .get(`/articles/${articleId}/comments`)
      .then(response => {
        if (!mounted) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setCommentaires(list);
        setStatusMsg(
          list.length === 0
            ? 'Aucun commentaire pour cet article.'
            : `${list.length} commentaire${list.length > 1 ? 's' : ''} chargé${list.length > 1 ? 's' : ''}.`
        );
      })
      .catch(() => {
        if (!mounted) return;
        setCommentaires([]);
        setStatusMsg('Erreur lors du chargement des commentaires.');
      });

    return () => {
      mounted = false;
    };
  }, [articleId]);

  return (
    <section aria-labelledby="comments-title">
      <h3 id="comments-title">
        <span aria-hidden="true">💬</span> Commentaires
      </h3>

      {/* Zone live pour lecteurs d’écran (et visible si tu veux) */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusMsg}
      </p>

      {commentaires.length === 0 ? (
        <p className="no-comments">Aucun commentaire pour cet article.</p>
      ) : (
        <ul className="with-comments" aria-label="Liste des commentaires">
          {commentaires.map((comment) => {
            const nomAuteur = comment.user_name || comment.author || 'Utilisateur inconnu';
            const texteContenu = comment.content ?? comment.body ?? '';
            const isoDate = comment.created_at ? new Date(comment.created_at).toISOString() : '';
            const dateLisible = comment.created_at
              ? new Date(comment.created_at).toLocaleString()
              : '';

            return (
              <li key={comment.comment_id}>
                <p>
                  <span aria-hidden="true">🧑</span>{' '}
                  <strong>{nomAuteur}</strong> a dit :
                </p>
                <p>{texteContenu}</p>
                {isoDate && (
                  <p>
                    <span aria-hidden="true">🕒</span>{' '}
                    <time dateTime={isoDate}>{dateLisible}</time>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ListeCommentaires;
