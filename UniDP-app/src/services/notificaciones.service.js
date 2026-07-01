import { supabase } from '../config/supabase';

export async function getNotificaciones(usuarioId) {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('creado_en', { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUnreadCount(usuarioId) {
  const { count, error } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .eq('leido', false);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function markNotificacionLeida(id) {
  const { error } = await supabase.from('notificaciones').update({ leido: true }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteNotificacion(id) {
  const { error } = await supabase.from('notificaciones').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markTodasLeidas(usuarioId) {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leido: true })
    .eq('usuario_id', usuarioId)
    .eq('leido', false);
  if (error) throw new Error(error.message);
}

export async function createNotificacionReporte({ usuarioId, tipo, titulo, mensaje, reporteId, eventoId }) {
  const { error } = await supabase.from('notificaciones').insert({
    usuario_id: usuarioId,
    tipo,
    titulo,
    mensaje: mensaje ?? null,
    reporte_id: reporteId ?? null,
    evento_id: eventoId ?? null,
    creado_en: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}
