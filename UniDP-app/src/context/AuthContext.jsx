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
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

const UDP_DOMAINS = ['@udp.cl', '@mail.udp.cl'];

function isUdpEmail(email) {
  return UDP_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * @param {string} email
   * @param {string} password
   */
  async function login(email, password) {
    if (!isUdpEmail(email)) {
      throw new Error('Solo se permiten correos institucionales (@udp.cl o @mail.udp.cl)');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Correo o contraseña incorrectos');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Debes confirmar tu correo antes de ingresar');
      }
      throw new Error('Error al iniciar sesión. Intenta nuevamente');
    }
  }

  /**
   * @param {string} email
   * @param {string} password
   * @param {string} nombre
   */
  async function register(email, password, nombre) {
    if (!isUdpEmail(email)) {
      throw new Error('Solo se permiten correos institucionales (@udp.cl o @mail.udp.cl)');
    }
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('Ya existe una cuenta con este correo');
      }
      throw new Error('Error al crear la cuenta. Intenta nuevamente');
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };