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
  loginWithGoogle as authLoginWithGoogle,
  logout as authLogout,
  getSession,
  onAuthStateChange,
  isUdpEmail,
} from '../services/auth.service';

const AuthContext = createContext(null);

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const subscription = onAuthStateChange((session) => {
      if (session?.user) {
        if (!isUdpEmail(session.user.email ?? '')) {
          authLogout();
          setUser(null);
          setAuthError('Solo se permiten cuentas institucionales UDP (@udp.cl o @mail.udp.cl)');
        } else {
          setUser(session.user);
          setAuthError(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loginWithGoogle() {
    await authLoginWithGoogle();
  }

  async function logout() {
    await authLogout();
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };