import { useEffect, useRef, useState } from 'react';
import styles from './DateTimePicker.module.css';

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function parseValue(value) {
  if (!value) return null;
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return { date: new Date(year, month - 1, day), time: timePart || '00:00' };
}

function toValue(date, time) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`;
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

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

function formatDisplay(value) {
  const parsed = parseValue(value);
  if (!parsed) return null;
  const dateLabel = parsed.date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
  return `${dateLabel}, ${parsed.time}`;
}

export default function DateTimePicker({ id, value, onChange, min, placeholder = 'Selecciona fecha y hora' }) {
  const parsed = parseValue(value);
  const minParsed = parseValue(min);
  const today = new Date();

  const initialDate = (parsed ?? minParsed)?.date ?? today;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function openPicker() {
    const base = parsed ?? minParsed;
    if (base) {
      setViewYear(base.date.getFullYear());
      setViewMonth(base.date.getMonth());
    }
    setOpen(o => !o);
  }

  function changeMonth(delta) {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth < 0) { newMonth = 11; newYear -= 1; }
    if (newMonth > 11) { newMonth = 0; newYear += 1; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  }

  function isBeforeMin(date) {
    if (!minParsed) return false;
    return dateKey(date) < dateKey(minParsed.date);
  }

  function handleDayClick(date) {
    if (isBeforeMin(date)) return;
    const time = parsed?.time ?? minParsed?.time ?? '00:00';
    onChange(toValue(date, time));
  }

  function handleTimeChange(e) {
    const time = e.target.value;
    if (!time) return;
    const date = parsed?.date ?? minParsed?.date ?? today;
    onChange(toValue(date, time));
  }

  const cells = buildCalendarGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString('es-CL', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.picker} ref={containerRef}>
      <button
        id={id}
        type="button"
        className={`${styles.trigger} ${!parsed ? styles.triggerEmpty : ''}`}
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">event</span>
        <span className={styles.triggerLabel}>{formatDisplay(value) || placeholder}</span>
      </button>

      {open && (
        <div className={styles.popover} role="dialog">
          <div className={styles.calendarHeader}>
            <button type="button" className={styles.navBtn} onClick={() => changeMonth(-1)} aria-label="Mes anterior">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className={styles.monthLabel}>{monthLabel}</span>
            <button type="button" className={styles.navBtn} onClick={() => changeMonth(1)} aria-label="Mes siguiente">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className={styles.weekRow}>
            {WEEK_DAYS.map((d, i) => (
              <span key={i} className={styles.weekDay}>{d}</span>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {cells.map(({ date, current }) => {
              const selected = parsed && dateKey(date) === dateKey(parsed.date);
              const disabled = isBeforeMin(date);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={[
                    styles.dayCell,
                    !current ? styles.dayOutside : '',
                    selected ? styles.daySelected : '',
                    disabled ? styles.dayDisabled : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleDayClick(date)}
                  disabled={disabled}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className={styles.timeRow}>
            <span className="material-symbols-outlined">schedule</span>
            <input
              type="time"
              className={styles.timeInput}
              value={parsed?.time ?? ''}
              onChange={handleTimeChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
