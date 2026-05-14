import { supabase } from '../config/supabase';

export async function createEvent({ titulo, categoria, facultad, descripcion, ubicacion, fechaInicio, duracion, esPublico, autorId, autorEmail }) {
  const horas = parseInt(duracion);
  const expiresAt = new Date(new Date(fechaInicio).getTime() + horas * 3600 * 1000).toISOString();

  const { data, error } = await supabase.from('events').insert({
    titulo:       titulo.trim(),
    categoria,
    facultad,
    descripcion:  descripcion.trim(),
    ubicacion:    ubicacion.trim(),
    duracion:     `${horas} hora${horas > 1 ? 's' : ''}`,
    fecha_inicio: new Date(fechaInicio).toISOString(),
    autor_id:     autorId,
    autor_email:  autorEmail,
    creado_en:    new Date().toISOString(),
    expires_at:   expiresAt,
    estado:       'activo',
    es_publico:   esPublico,
  }).select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getActiveEvents({ facultad, categoria } = {}) {
  let query = supabase
    .from('events')
    .select('*')
    .eq('estado', 'activo')
    .order('fecha_inicio', { ascending: true });

  if (facultad) query = query.eq('facultad', facultad);
  if (categoria) query = query.eq('categoria', categoria);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
