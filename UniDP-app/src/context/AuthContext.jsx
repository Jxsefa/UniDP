/**
 * @file AuthContext.jsx
 * @description Contexto global de autenticación usando Supabase.
 * Provee user, loading, login, register y logout a toda la app.
 *
 * @usage
 * // Envolver la app en AuthProvider, luego consumir con useAuth()
 * import { AuthProvider } from './context/AuthContext';
 */

import { createContext, useContext, useEffect, useState } from 'react';
import {
  loginWithEmail,
  registerWithEmail,
  logout as authLogout,
  getSession,
  onAuthStateChange,
} from '../services/auth.service';

const AuthContext = createContext(null);

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const subscription = onAuthStateChange((session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    await loginWithEmail(email, password);
  }

  async function register(email, password, nombre) {
    await registerWithEmail(email, password, nombre);
  }

  async function logout() {
    await authLogout();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };