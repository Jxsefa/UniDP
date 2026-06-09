import { supabase } from '../config/supabase';

const UDP_DOMAINS = ['@udp.cl', '@mail.udp.cl'];

export function isUdpEmail(email) {
  return UDP_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
}

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
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

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(userId, { nombre, biografia, fotoFile }) {
  let foto_url = null;
  if (fotoFile) {
    const path = `avatars/${userId}`;
    await supabase.storage.from('profiles').upload(path, fotoFile, { upsert: true });
    const { data } = supabase.storage.from('profiles').getPublicUrl(path);
    foto_url = data.publicUrl;
  }
  const updates = { nombre };
  if (biografia !== undefined) updates.biografia = biografia;
  if (foto_url) updates.foto_url = foto_url;

  let { error } = await supabase.from('usuario').update(updates).eq('id', userId);
  // Retry without biografia if that column doesn't exist yet
  if (error && updates.biografia !== undefined) {
    const { biografia: _b, ...safeUpdates } = updates;
    ({ error } = await supabase.from('usuario').update(safeUpdates).eq('id', userId));
  }
  if (error) throw new Error(error.message);
}
