// src/components/Modal.jsx
import React, { useEffect, useRef } from 'react';

export default function Modal({
  open,
  title = 'Confirmation',
  children,
  onCancel,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
}) {
  const modalRef = useRef(null);

  // Focus + ESC + scroll lock
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus sur la modale
    modalRef.current?.focus();

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={onCancel}
    >
      <div
        className="modal-card"
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <h3 id="modal-title">{title}</h3>

        <div id="modal-description" className="modal-body">
          {children}
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>

          <button
            className="btn btn-primary"
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}