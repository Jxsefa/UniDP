/**
 * Datos de muestra compartidos entre las propuestas de diseño del dashboard.
 * No pega a Supabase — solo para maquetar en /design-preview.
 */

function at(dayOffset, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const MOCK_EVENTS = [
  {
    id: 'e1',
    titulo: 'Taller de IA Generativa',
    categoria: 'Academia',
    ubicacion: 'Facultad de Ingeniería · Sala B203',
    fecha_in: at(0, 11, 0),
    fecha_fin: at(0, 13, 0),
    organizer: 'Club de Robótica',
    interesados: 34,
    capacidad: 40,
  },
  {
    id: 'e2',
    titulo: 'Ensayo abierto — Teatro UDP',
    categoria: 'Clubes',
    ubicacion: 'Casa Central · Auditorio',
    fecha_in: at(0, 13, 30),
    fecha_fin: at(0, 15, 0),
    organizer: 'Compañía de Teatro UDP',
    interesados: 12,
    capacidad: 80,
  },
  {
    id: 'e3',
    titulo: 'Feria de clubes y colectivos',
    categoria: 'Social',
    ubicacion: 'Patio Central',
    fecha_in: at(0, 15, 30),
    fecha_fin: at(0, 18, 0),
    organizer: 'Federación de Estudiantes',
    interesados: 128,
    capacidad: 300,
  },
  {
    id: 'e4',
    titulo: 'Torneo relámpago de fútbol 5',
    categoria: 'Deporte',
    ubicacion: 'Campus Huechuraba · Cancha techada',
    fecha_in: at(0, 18, 30),
    fecha_fin: at(0, 20, 30),
    organizer: 'Selección UDP',
    interesados: 61,
    capacidad: 64,
  },
  {
    id: 'e5',
    titulo: 'Conversatorio: Ética y datos',
    categoria: 'Academia',
    ubicacion: 'Facultad de Derecho · Sala 402',
    fecha_in: at(1, 10, 0),
    fecha_fin: at(1, 11, 30),
    organizer: 'Depto. de Filosofía',
    interesados: 19,
    capacidad: 50,
  },
  {
    id: 'e6',
    titulo: 'Noche de trivia interfacultades',
    categoria: 'Social',
    ubicacion: 'Terraza Casa Central',
    fecha_in: at(1, 19, 0),
    fecha_fin: at(1, 21, 0),
    organizer: 'Bienestar Estudiantil',
    interesados: 87,
    capacidad: 100,
  },
  {
    id: 'e7',
    titulo: 'Clínica de escalada',
    categoria: 'Deporte',
    ubicacion: 'Gimnasio UDP',
    fecha_in: at(2, 9, 0),
    fecha_fin: at(2, 11, 0),
    organizer: 'Club Andino UDP',
    interesados: 8,
    capacidad: 20,
  },
  {
    id: 'e8',
    titulo: 'Muestra de fotografía análoga',
    categoria: 'Clubes',
    ubicacion: 'Biblioteca Nudos · Sala de exposición',
    fecha_in: at(2, 12, 0),
    fecha_fin: at(2, 20, 0),
    organizer: 'Club de Fotografía',
    interesados: 23,
    capacidad: 200,
  },
];

export function getInitials(nombre) {
  const parts = (nombre || '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (nombre || '').slice(0, 2).toUpperCase();
}
