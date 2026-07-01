import { supabase } from '../config/supabase';

export async function createReporte({ eventoId, reportadorId, motivo, descripcion }) {
  const { data: existing } = await supabase
    .from('reportes')
    .select('id')
    .eq('evento_id', eventoId)
    .eq('reportador_id', reportadorId)
    .maybeSingle();
  if (existing) throw new Error('YA_DENUNCIADO');

  const { error } = await supabase.from('reportes').insert({
    evento_id: eventoId,
    reportador_id: reportadorId,
    motivo,
    descripcion: descripcion?.trim() || null,
    creado_en: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function getReportes() {
  const { data, error } = await supabase
    .from('reportes')
    .select('*')
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateReporteEstado(id, estado) {
  const { error } = await supabase.from('reportes').update({ estado }).eq('id', id);
  if (error) throw new Error(error.message);
}
