import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getEventosMeInteresa } from '../../services/events.service';
import styles from './SavedEventsCalendar.module.css';

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function toDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleString('es-CL', {
    month: 'long', year: 'numeric',
  });
}

function formatHour(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
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
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), current: false });
  }
  return cells;
}

export default function SavedEventsCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    function loadEvents() {
      setLoading(true);
      getEventosMeInteresa(user.id)
        .then(setEvents)
        .catch(() => setEvents([]))
        .finally(() => setLoading(false));
    }

    loadEvents();

    window.addEventListener('interes-changed', loadEvents);
    const interval = setInterval(loadEvents, 60000);
    return () => {
      window.removeEventListener('interes-changed', loadEvents);
      clearInterval(interval);
    };
  }, [user]);

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

  return (
    <aside className={styles.widget}>
      <div className={styles.calendarHeader}>
        <button className={styles.navBtn} onClick={prevMonth} type="button" aria-label="Mes anterior">
          <ChevronLeft size={16} />
        </button>
        <h3 className={styles.monthTitle}>{formatMonthYear(viewYear, viewMonth)}</h3>
        <button className={styles.navBtn} onClick={nextMonth} type="button" aria-label="Mes siguiente">
          <ChevronRight size={16} />
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
                !cell.current  ? styles.dayCellOther    : '',
                isToday        ? styles.dayCellToday    : '',
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

      <div className={styles.listSection}>
        <h4 className={styles.listTitle}>
          {selectedDay ? 'Eventos del día' : 'Mis eventos guardados'}
        </h4>

        {!loading && displayedEvents.length === 0 && (
          <p className={styles.empty}>
            {selectedDay ? 'Sin eventos guardados en este día.' : 'Aún no tienes eventos guardados.'}
          </p>
        )}

        <div className={styles.eventList}>
          {displayedEvents.filter(Boolean).map(ev => {
            const dateField = ev.fecha_in || ev.creado_en;
            return (
              <button
                key={ev.id}
                type="button"
                className={styles.eventItem}
                onClick={() => navigate('/calendario')}
              >
                <span className={styles.eventDot2} />
                <span className={styles.eventInfo}>
                  <span className={styles.eventTitle}>{ev.titulo}</span>
                  {dateField && (
                    <span className={styles.eventTime}>
                      <Clock size={11} />
                      {formatHour(dateField)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {events.length > 0 && (
          <button className={styles.viewAllBtn} onClick={() => navigate('/calendario')} type="button">
            <Calendar size={14} />
            Ver calendario completo
          </button>
        )}
      </div>
    </aside>
  );
}
