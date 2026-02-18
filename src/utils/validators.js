// src/utils/validators.js

// Titre : supprime balises/zero-width, compacte espaces, trim
export const normalizeTitle = v => {
  let s = typeof v === 'string' ? v : '';
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');   // zero-width
  s = s.replace(/<[^>]*>/g, '');               // balises HTML
  s = s.replace(/\s+/g, ' ');                  // espaces multiples -> un seul
  return s.trim();
};

// Description : conserve les retours à la ligne saisis,
// juste normalise les fins de ligne et trim global
export const normalizeDescription = v => {
  let s = typeof v === 'string' ? v : '';
  s = s.replace(/\r\n?/g, '\n');               // CRLF -> \n
  return s.trim();
};

// Au moins un caractère alphanumérique (accents inclus)
export const hasMeaningfulChars = s =>
  /[A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(s || '');
