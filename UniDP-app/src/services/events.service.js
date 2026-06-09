import { supabase } from '../config/supabase';

export async function uploadEventImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('eventos').upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('eventos').getPublicUrl(path);
  return data.publicUrl;
}

export async function createEvent({ titulo, categoria, descripcion, ubicacion, fechaInicio, duracion, capacidad, autorId, imagenUrl }) {
  const horas    = parseInt(duracion);
  const fechaFin = new Date(new Date(fechaInicio).getTime() + horas * 3600 * 1000).toISOString();

  const { data, error } = await supabase.from('evento').insert({
    titulo:      titulo.trim(),
    categoria:   categoria,
    descripcion: descripcion.trim(),
    ubicacion:   ubicacion,
    duracion:    `${horas} hora${horas > 1 ? 's' : ''}`,
    autor_id:    autorId,
    creado_en:   new Date().toISOString(),
    fecha_in:    new Date(fechaInicio).toISOString(),
    expires_at:  fechaFin,
    fecha_fin:   fechaFin,
    estado:      'activo',
    es_oficial:  true,
    capacidad:   capacidad ?? null,
    imagen_url:  imagenUrl ?? null,
  }).select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getActiveEvents({ facultad, categoria } = {}) {
  let query = supabase
    .from('evento')
    .select('*')
    .eq('estado', 'activo')
    .gt('expires_at', new Date().toISOString())
    .order('creado_en', { ascending: false })
    .limit(20);

  if (facultad) query = query.eq('facultad', facultad);
  if (categoria) query = query.eq('categoria', categoria);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function searchEvents({ query, categoria } = {}) {
  let q = supabase
    .from('evento')
    .select('*')
    .eq('estado', 'activo')
    .gt('expires_at', new Date().toISOString())
    .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`)
    .order('creado_en', { ascending: false })
    .limit(20);

  if (categoria) q = q.eq('categoria', categoria);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

export async function getEventById(id) {
  const { data, error } = await supabase
    .from('evento')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getEventosByAutor(autorId) {
  const { data, error } = await supabase
    .from('evento').select('*')
    .eq('autor_id', autorId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getEventosPasados(usuarioId) {
  const { data, error } = await supabase
    .from('evento').select('*')
    .eq('autor_id', usuarioId)
    .lt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function toggleInteres(usuarioId, eventoId) {
  const { data: existing } = await supabase
    .from('intereses')
    .select('id')
    .eq('usuario_id', usuarioId)
    .eq('evento_id', eventoId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase.from('intereses').delete().eq('id', existing.id);
    if (error) throw new Error(error.message);
    return false;
  } else {
    const { error } = await supabase.from('intereses')
      .insert({ usuario_id: usuarioId, evento_id: eventoId, creado_en: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return true;
  }
}

export async function checkInteres(usuarioId, eventoId) {
  const { data } = await supabase
    .from('intereses')
    .select('id')
    .eq('usuario_id', usuarioId)
    .eq('evento_id', eventoId)
    .maybeSingle();
  return !!data;
}

export async function getInteresCount(eventoId) {
  const { count } = await supabase
    .from('intereses')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', eventoId);
  return count ?? 0;
}

export async function getEventosMeInteresa(usuarioId) {
  const { data, error } = await supabase
    .from('intereses')
    .select('evento_id, creado_en, evento(*)')
    .eq('usuario_id', usuarioId)
    .order('creado_en', { ascending: true });
  if (error) throw new Error(error.message);
  return data
    .map(item => item.evento)
    .filter(Boolean)
    .filter(ev => new Date(ev.expires_at) > new Date());
}
