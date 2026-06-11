/**
 * @file AuthContext.jsx
 * @description Contexto global de autenticación usando Supabase.
 * Provee user, loading, login, register y logout a toda la app.
 *
 * @usage
 * // Envolver la app en AuthProvider, luego consumir con useAuth()
 * import { AuthProvider } from './context/AuthContext';
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  loginWithGoogle as authLoginWithGoogle,
  logout as authLogout,
  getSession,
  onAuthStateChange,
  isUdpEmail,
  ensureUserProfile,
  getUserProfile,
  saveAccount,
} from '../services/auth.service';

const AuthContext = createContext(null);

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const userIdRef = useRef(null);

  function loadProfile(userId) {
    getUserProfile(userId).then(setProfile).catch(console.error);
  }

  useEffect(() => {
    // Si Google/Supabase redirige con un error en el hash (#error=...&error_description=...),
    // mostrarlo en vez de fallar en silencio y dejar al usuario en /login.
    if (window.location.hash.includes('error=')) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const description = params.get('error_description');
      if (description) {
        setAuthError(decodeURIComponent(description.replace(/\+/g, ' ')));
      }
      window.history.replaceState(null, '', window.location.pathname);
    }

    getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        userIdRef.current = session.user.id;
        ensureUserProfile(session.user).catch((err) => console.error('ensureUserProfile:', err));
        loadProfile(session.user.id);
        saveAccount(session.user);
      }
    });

    const subscription = onAuthStateChange((session) => {
      if (session?.user) {
        if (!isUdpEmail(session.user.email ?? '')) {
          authLogout();
          userIdRef.current = null;
          setUser(null);
          setProfile(null);
          setAuthError('Solo se permiten cuentas institucionales UDP (@udp.cl o @mail.udp.cl)');
        } else if (userIdRef.current !== session.user.id) {
          // Solo recargar perfil/datos cuando cambia el usuario real
          // (Supabase dispara este evento también al refrescar token al volver a la pestaña)
          userIdRef.current = session.user.id;
          setUser(session.user);
          setAuthError(null);
          ensureUserProfile(session.user).catch((err) => console.error('ensureUserProfile:', err));
          loadProfile(session.user.id);
          saveAccount(session.user);
        }
      } else {
        userIdRef.current = null;
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loginWithGoogle(options) {
    await authLoginWithGoogle(options);
  }

  async function logout() {
    await authLogout();
  }

  function refreshProfile() {
    if (user) loadProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };