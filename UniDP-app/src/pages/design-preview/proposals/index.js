/**
 * Registro de propuestas visibles en /design-preview.
 * Cada entrada: { id, label, Component }. Agregar un archivo nuevo en esta
 * carpeta por propuesta y registrarlo acá cuando se pida "hazme algo en design preview".
 */
import TimetableProposal from './TimetableProposal';

export const PROPOSALS = [
  { id: 'horario', label: 'Horario en vivo', Component: TimetableProposal },
];
