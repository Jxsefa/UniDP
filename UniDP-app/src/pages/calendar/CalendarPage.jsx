import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Calendar, GraduationCap, Users, Users2, Trophy,
  ChevronLeft, ChevronRight, Clock, MapPin, Plus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getEventosMeInteresa, toggleInteres } from '../../services/events.service';
import Spinner from '../../components/ui/Spinner';
import styles from './CalendarPage.module.css';

const NAV_ITEMS = [
  { path: '/dashboard',  categoria: null,       label: 'Home',       Icon: Home },
  { path: '/calendario', categoria: null,        label: 'Calendario', Icon: Calendar },
  { path: '/dashboard',  categoria: 'Academia',  label: 'Académico',  Icon: GraduationCap },
  { path: '/dashboard',  categoria: 'Social',    label: 'Social',     Icon: Users },
  { path: '/dashboard',  categoria: 'Deporte',   label: 'Deportes',   Icon: Trophy },
  { path: '/dashboard',  categoria: 'Clubes',    label: 'Clubes',     Icon: Users2 },
];

const BOTTOM_NAV = [
  { path: '/dashboard',  categoria: null,       label: 'Home',      Icon: Home },
  { path: '/calendario', categoria: null,        label: 'Eventos',   Icon: Calendar },
  { path: '/dashboard',  categoria: 'Academia',  label: 'Académico', Icon: GraduationCap },
  { path: '/dashboard',  categoria: 'Social',    label: 'Social',    Icon: Users },
  { path: '/dashboard',  categoria: 'Deporte',   label: 'Deportes',  Icon: Trophy },
  { path: '/dashboard',  categoria: 'Clubes',    label: 'Clubes',    Icon: Users2 },
];

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/* ── Helpers ─────────────────────────────────────────────── */
function toDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleString('es-CL', {
    month: 'long', year: 'numeric',
  });
}

function formatDayHeader(date) {
  return date.toLocaleString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function formatBadgeMonth(date) {
  return date.toLocaleString('es-CL', { month: 'short' }).replace('.', '');
}

function formatHour(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

/** Returns the grid cells for a given month: includes padding days from prev/next month. */
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  // Monday-based: getDay() returns 0=Sun → shift so Mon=0
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  const remaining = 42 - cells.length; // always 6 rows × 7
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), current: false });
  }

  return cells;
}

/* ── Component ───────────────────────────────────────────── */
export default function CalendarPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    getEventosMeInteresa(user.id)
      .then(setEvents)
      .catch(() => setError('No se pudieron cargar los eventos.'))
      .finally(() => setLoading(false));
  }, [user]);

  /* Map dateKey → list of events for fast lookup */
  const eventsByDay = events.reduce((acc, ev) => {
    const dateField = ev.fecha_in || ev.creado_en;
    if (!dateField) return acc;
    const key = toDateKey(new Date(dateField));
    (acc[key] = acc[key] || []).push(ev);
    return acc;
  }, {});

  const grid = buildCalendarGrid(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  function handleDayClick(cell) {
    const key = toDateKey(cell.date);
    setSelectedDay(prev => (prev === key ? null : key));
  }

  const displayedEvents = selectedDay
    ? (eventsByDay[selectedDay] || [])
    : events;

  const listTitle = selectedDay
    ? `Eventos del ${formatDayHeader(new Date(...selectedDay.split('-').map(Number)))}`
    : 'Mis eventos guardados';

  async function handleRemove(evId) {
    const prev = events;
    const newEvents = events.filter(e => e.id !== evId);
    setEvents(newEvents);
    if (selectedDay) {
      const stillHas = newEvents.some(e => {
        const df = e.fecha_in || e.creado_en;
        return df && toDateKey(new Date(df)) === selectedDay;
      });
      if (!stillHas) setSelectedDay(null);
    }
    try {
      await toggleInteres(user.id, evId);
    } catch {
      setEvents(prev);
    }
  }

  function handleNavClick({ path, categoria }) {
    if (categoria) {
      navigate(path, { state: { categoria } });
    } else {
      navigate(path);
    }
  }

  // On /calendario only the Calendario item (no categoria, matching path) is active.
  function isNavActive({ path, categoria }) {
    if (location.pathname !== path) return false;
    if (categoria) return false;
    return true;
  }

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className={styles.layout}>

      {/* ── Sidebar — desktop only ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>UniDP Hub</span>
          <span className={styles.sidebarSub}>Universidad Diego Portales</span>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`${styles.navItem} ${isNavActive(item) ? styles.navItemActive : ''}`}
              onClick={() => handleNavClick(item)}
              type="button"
            >
              <item.Icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.createBtnFull}
            onClick={() => navigate('/crear-evento')}
            type="button"
          >
            <Plus size={18} />
            Crear Evento
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        <div className={styles.content}>

          {loading && <Spinner />}

          {error && (
            <div className={styles.center}><p>{error}</p></div>
          )}

          {!loading && !error && (
            <>
              {/* ── Monthly calendar ── */}
              <section className={styles.calendarSection}>
                <div className={styles.calendarHeader}>
                  <button className={styles.navBtn} onClick={prevMonth} type="button" aria-label="Mes anterior">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className={styles.monthTitle}>
                    {formatMonthYear(viewYear, viewMonth)}
                  </h2>
                  <button className={styles.navBtn} onClick={nextMonth} type="button" aria-label="Mes siguiente">
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className={styles.weekRow}>
                  {WEEK_DAYS.map((d, i) => (
                    <span key={i} className={styles.weekDay}>{d}</span>
                  ))}
                </div>

                <div className={styles.calendarGrid}>
                  {grid.map((cell, i) => {
                    const key      = toDateKey(cell.date);
                    const isToday  = toDateKey(today) === key;
                    const hasDot   = !!eventsByDay[key];
                    const selected = selectedDay === key;

                    return (
                      <button
                        key={i}
                        type="button"
                        className={[
                          styles.dayCell,
                          !cell.current  ? styles.dayCellOther   : '',
                          isToday        ? styles.dayCellToday   : '',
                          selected       ? styles.dayCellSelected : '',
                        ].join(' ')}
                        onClick={() => handleDayClick(cell)}
                      >
                        <span className={styles.dayNumber}>{cell.date.getDate()}</span>
                        {hasDot && <span className={styles.eventDot} />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── Event list ── */}
              <section className={styles.listSection}>
                <h3 className={styles.listTitle}>{listTitle}</h3>

                {displayedEvents.length === 0 && (
                  <div className={styles.empty}>
                    <Calendar size={40} strokeWidth={1.5} />
                    <p>
                      {selectedDay
                        ? 'No hay eventos guardados en este día.'
                        : 'Aún no tienes eventos guardados. ¡Explora el feed!'}
                    </p>
                  </div>
                )}

                <div className={styles.eventList}>
                  {displayedEvents.filter(Boolean).map(ev => {
                    const dateField = ev.fecha_in || ev.creado_en;
                    const evDate    = dateField ? new Date(dateField) : null;
                    return (
                      <div key={ev.id} className={styles.eventCard}>
                        {/* Date badge */}
                        {evDate && (
                          <div className={styles.dateBadge}>
                            <span className={styles.badgeMonth}>
                              {formatBadgeMonth(evDate)}
                            </span>
                            <span className={styles.badgeDay}>
                              {evDate.getDate()}
                            </span>
                          </div>
                        )}

                        {/* Info */}
                        <div className={styles.eventInfo}>
                          {ev.categoria && (
                            <span className={styles.eventCategory}>{ev.categoria}</span>
                          )}
                          <p className={styles.eventTitle}>{ev.titulo}</p>
                          <div className={styles.eventMeta}>
                            {dateField && (
                              <span className={styles.metaItem}>
                                <Clock size={13} />
                                {formatHour(dateField)}
                              </span>
                            )}
                            {ev.ubicacion && (
                              <span className={styles.metaItem}>
                                <MapPin size={13} />
                                {ev.ubicacion}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.cardActions}>
                          {ev.imagen_url && (
                            <img
                              src={ev.imagen_url}
                              alt={ev.titulo}
                              className={styles.thumb}
                            />
                          )}
                          <button
                            className={styles.removeBtn}
                            onClick={() => handleRemove(ev.id)}
                            type="button"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* ── Bottom navigation — mobile only ── */}
      <nav className={styles.bottomNav}>
        {BOTTOM_NAV.map((item) => (
          <button
            key={item.label}
            className={`${styles.bottomNavItem} ${isNavActive(item) ? styles.bottomNavActive : ''}`}
            onClick={() => handleNavClick(item)}
            type="button"
          >
            <item.Icon size={22} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── FAB — mobile only ── */}
      <button
        className={styles.fab}
        onClick={() => navigate('/crear-evento')}
        aria-label="Crear evento"
        type="button"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
