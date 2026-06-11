export const FALLBACK_COLORS = ['#b70006', '#5e3f3a', '#936e69'];

export function formatTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function formatDateBadge(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return {
    month: date.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '').toUpperCase(),
    day: date.getDate(),
  };
}

export function formatWeekdayDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export function formatTimeRange(startIso, endIso) {
  if (!startIso) return null;
  const start = formatTime(startIso);
  const end = endIso ? formatTime(endIso) : null;
  return end ? `${start} - ${end}` : start;
}

export function getInitials(nombre) {
  const parts = (nombre || '').trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (nombre || '').slice(0, 2).toUpperCase();
}
