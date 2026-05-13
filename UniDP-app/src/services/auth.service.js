import { supabase } from '../config/supabase';

const UDP_DOMAINS = ['@udp.cl', '@mail.udp.cl'];

export function isUdpEmail(email) {
  return UDP_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
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
