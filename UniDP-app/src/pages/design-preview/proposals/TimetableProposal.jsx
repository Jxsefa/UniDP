import { MOCK_EVENTS } from './mockData';
import styles from './TimetableProposal.module.css';

const START_HOUR = 8;
const END_HOUR = 22;
const ROW_HEIGHT = 56;
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * ROW_HEIGHT;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

const CATEGORY_COLOR = {
  Academia: '#2c4a7c',
  Social: '#b76e00',
  Deporte: '#1f7a4d',
  Clubes: '#7a3b8c',
};

function decimalHour(date) {
  return date.getHours() + date.getMinutes() / 60;
}

function dayOffsetFromToday(date) {
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((b - a) / 86400000);
}

function buildDays() {
  const today = new Date();
  return [0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return {
      offset,
      label: offset === 0 ? 'Hoy' : d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }).replace('.', ''),
      events: MOCK_EVENTS.filter((ev) => dayOffsetFromToday(new Date(ev.fecha_in)) === offset),
    };
  });
}

function EventBlock({ event }) {
  const start = new Date(event.fecha_in);
  const end = new Date(event.fecha_fin);
  const top = Math.max(0, (decimalHour(start) - START_HOUR) * ROW_HEIGHT);
  const height = Math.max(30, (decimalHour(end) - decimalHour(start)) * ROW_HEIGHT - 3);
  const color = CATEGORY_COLOR[event.categoria] ?? '#555';
  const time = start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div
      className={styles.block}
      style={{ top: `${top}px`, height: `${height}px`, borderLeftColor: color }}
    >
      <span className={styles.blockTime}>{time}</span>
      <span className={styles.blockTitle}>{event.titulo}</span>
      <span className={styles.blockLoc}>{event.ubicacion}</span>
    </div>
  );
}

export default function TimetableProposal() {
  const days = buildDays();
  const now = new Date();
  const nowHour = decimalHour(now);
  const showNowLine = nowHour >= START_HOUR && nowHour <= END_HOUR;
  const nowTop = (nowHour - START_HOUR) * ROW_HEIGHT;
  const nowLabel = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Horario en vivo</h1>
          <p className={styles.subtitle}>El campus, leído como tu horario de clases</p>
        </div>
        <ul className={styles.legend}>
          {Object.entries(CATEGORY_COLOR).map(([label, color]) => (
            <li key={label} className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: color }} />
              {label}
            </li>
          ))}
        </ul>
      </header>

      <div className={styles.grid}>
        <div className={styles.rulerCol} style={{ height: `${TOTAL_HEIGHT}px` }}>
          {HOURS.map((h, i) => (
            <span key={h} className={styles.hourLabel} style={{ top: `${i * ROW_HEIGHT}px` }}>
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
        </div>

        {days.map((day) => (
          <div key={day.offset} className={styles.dayCol}>
            <div className={styles.dayHeader}>{day.label}</div>
            <div
              className={styles.dayBody}
              style={{ height: `${TOTAL_HEIGHT}px`, backgroundSize: `100% ${ROW_HEIGHT}px` }}
            >
              {day.offset === 0 && showNowLine && (
                <div className={styles.nowLine} style={{ top: `${nowTop}px` }}>
                  <span className={styles.nowDot} />
                  <span className={styles.nowLabel}>{nowLabel}</span>
                </div>
              )}
              {day.events.map((event) => (
                <EventBlock key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
