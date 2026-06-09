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
    .order('creado_en', { ascending: false });

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
    .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`)
    .order('creado_en', { ascending: false });

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
