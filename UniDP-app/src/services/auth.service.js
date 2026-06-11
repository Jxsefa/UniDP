import { supabase } from '../config/supabase';

const UDP_DOMAINS = ['@udp.cl', '@mail.udp.cl'];

export function isUdpEmail(email) {
  return UDP_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
}

export async function loginWithGoogle({ loginHint } = {}) {
  const queryParams = { hd: 'mail.udp.cl' };
  if (loginHint) {
    queryParams.login_hint = loginHint;
  } else {
    queryParams.prompt = 'select_account';
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      queryParams,
    },
  });
  if (error) throw new Error('Error al iniciar sesión con Google');
}

export async function logout() {
  await supabase.auth.signOut();
}

const SAVED_ACCOUNT_KEY = 'unidp_saved_account';

export function getSavedAccount() {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAccount(user) {
  if (!user?.email) return;
  const account = {
    email: user.email,
    nombre: user.user_metadata?.full_name || user.email,
    avatar: user.user_metadata?.avatar_url || null,
  };
  localStorage.setItem(SAVED_ACCOUNT_KEY, JSON.stringify(account));
}

export function clearSavedAccount() {
  localStorage.removeItem(SAVED_ACCOUNT_KEY);
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

export async function ensureUserProfile(user) {
  const { data, error: selectError } = await supabase
    .from('usuario')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (selectError) throw new Error(selectError.message);
  if (data) return;

  const { error } = await supabase.from('usuario').insert({
    id: user.id,
    nombre: user.user_metadata?.full_name || user.email,
    email: user.email,
  });
  if (error) throw new Error(error.message);
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

export async function getUsuariosByIds(userIds) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (!uniqueIds.length) return {};

  const { data, error } = await supabase
    .from('usuario')
    .select('id, nombre, foto_url')
    .in('id', uniqueIds);
  if (error) throw new Error(error.message);

  const byId = {};
  (data ?? []).forEach((u) => { byId[u.id] = u; });
  return byId;
}

export async function updateProfile(userId, { nombre, biografia, fotoFile }) {
  let foto_url = null;
  if (fotoFile) {
    const path = `avatars/${userId}`;
    await supabase.storage.from('profiles').upload(path, fotoFile, { upsert: true });
    const { data } = supabase.storage.from('profiles').getPublicUrl(path);
    foto_url = `${data.publicUrl}?t=${Date.now()}`;
  }
  const updates = { nombre };
  if (biografia !== undefined) updates.biografia = biografia;
  if (foto_url) updates.foto_url = foto_url;

  let { error } = await supabase.from('usuario')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' });
  // Retry without biografia if that column doesn't exist yet
  if (error && updates.biografia !== undefined) {
    const { biografia: _b, ...safeUpdates } = updates;
    ({ error } = await supabase.from('usuario').update(safeUpdates).eq('id', userId));
  }
  if (error) throw new Error(error.message);
}
