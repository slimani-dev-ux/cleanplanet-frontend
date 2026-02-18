// src/context/AuthContext.jsx
import { createContext, useEffect, useState, useMemo } from 'react';
import api from '../api'; // ⚠️ vérifie le chemin : pas ../api/api

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshIdentity = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setIdentity(data);
    } catch {
      setIdentity(null);
    }
  };

  const login = async (email, password) => {
    await api.post('/auth/login', { email, password }); // cookie httpOnly
    await refreshIdentity(); // <-- met à jour immédiatement le contexte
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setIdentity(null);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshIdentity();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ identity, loading, refreshIdentity, login, logout }),
    [identity, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
