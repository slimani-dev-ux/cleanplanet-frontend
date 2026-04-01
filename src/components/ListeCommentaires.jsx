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
            : `${list.length} commentaire${list.length > 1 ? 's' : ''} chargé${list.length > 1 ? 's' : ''}.`,
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

      <p className="sr-only" role="status" aria-live="polite">
        {statusMsg}
      </p>

      {commentaires.length === 0 ? (
        <p className="no-comments">Aucun commentaire pour cet article.</p>
      ) : (
        <ul className="with-comments" aria-label="Liste des commentaires">
          {commentaires.map(comment => {
            const nomAuteur =
              comment.user_name || comment.author || 'Utilisateur inconnu';
            const texteContenu = comment.content ?? comment.body ?? '';

            const dateObjet = comment.created_at
              ? new Date(comment.created_at)
              : null;

            const dateValide =
              dateObjet instanceof Date && !Number.isNaN(dateObjet.getTime());

            const isoDate = dateValide ? dateObjet.toISOString() : '';
            const dateLisible = dateValide ? dateObjet.toLocaleString() : '';

            return (
              <li key={comment.comment_id}>
                <article aria-label={`Commentaire de ${nomAuteur}`}>
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
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ListeCommentaires;
