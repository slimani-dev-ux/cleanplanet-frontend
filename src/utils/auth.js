/* Rôle courant basé sur le stockage local (priorité membre) */
export function getUserRole() {
  /* Priorité : session membre */
  const memberRaw = localStorage.getItem('member');
  if (memberRaw && memberRaw !== 'undefined' && memberRaw !== 'null') {
    try {
      const member = JSON.parse(memberRaw);
      if (member && (member.role || member?.member_id)) {
        return member.role ? String(member.role).toLowerCase() : 'member';
      }
    } catch {
      /* En cas de JSON invalide mais clé présente, on suppose 'member' */
      return 'member';
    }
  }

  /* Ensuite : session utilisateur (admin ou user) */
  const userRaw = localStorage.getItem('user');
  if (userRaw && userRaw !== 'undefined' && userRaw !== 'null') {
    try {
      const user = JSON.parse(userRaw);
      if (user && user.role) {
        const role = String(user.role).toLowerCase();
        if (role === 'admin') return 'admin';
        if (role === 'user') return 'user';
      }
    } catch {
      /* JSON invalide : on ne déduit pas de rôle utilisateur */
    }
  }

  /* Aucun rôle déterminé */
  return null;
}
