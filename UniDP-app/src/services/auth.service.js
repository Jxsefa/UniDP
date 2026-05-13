import { supabase } from '../config/supabase';

const UDP_DOMAINS = ['@udp.cl', '@mail.udp.cl'];

export function isUdpEmail(email) {
  return UDP_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
}

export async function loginWithEmail(email, password) {
  if (!isUdpEmail(email)) {
    throw new Error('Solo se permiten correos institucionales (@udp.cl o @mail.udp.cl)');
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes('Invalid login credentials')) throw new Error('Correo o contraseña incorrectos');
    if (error.message.includes('Email not confirmed')) throw new Error('Debes confirmar tu correo antes de ingresar');
    throw new Error('Error al iniciar sesión. Intenta nuevamente');
  }
}

export async function registerWithEmail(email, password, nombre) {
  if (!isUdpEmail(email)) {
    throw new Error('Solo se permiten correos institucionales (@udp.cl o @mail.udp.cl)');
  }
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { nombre } } });
  if (error) {
    if (error.message.includes('User already registered')) throw new Error('Ya existe una cuenta con este correo');
    throw new Error('Error al crear la cuenta. Intenta nuevamente');
  }
}

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
      queryParams: { hd: 'mail.udp.cl' },
    },
  });
  if (error) throw new Error('Error al iniciar sesión con Google');
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
}
