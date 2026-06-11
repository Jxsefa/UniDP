import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, X, MapPin,
} from 'lucide-react';
import {
  getActiveEvents, searchEvents,
} from '../../services/events.service';
import { getUsuariosByIds } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { useInteres } from '../../hooks/useInteres';
import { CATEGORIES } from '../../constants/categories';
import { FALLBACK_COLORS, formatTime, getInitials } from '../../utils/eventFormat';
import InteresadosAvatars from '../../components/dashboard/InteresadosAvatars';
import EventDrawer from '../../components/dashboard/EventDrawer';
import SavedEventsCalendar from '../../components/dashboard/SavedEventsCalendar';
import AppShell from '../../components/layout/AppShell';
import styles from './DashboardPage.module.css';

const ALL_TAB = { id: null, label: 'Todos' };
const TABS = [ALL_TAB, ...CATEGORIES];

function formatDayLabel(date) {
  const dayMonth = date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }).replace('.', '');
  const weekday = date.toLocaleDateString('es-CL', { weekday: 'long' });
  return { dayMonth, weekday };
}

function groupEventsByDate(events) {
  const groups = [];
  const map = new Map();
  for (const event of events) {
    if (!event.fecha_in) continue;
    const date = new Date(event.fecha_in);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    let group = map.get(key);
    if (!group) {
      group = { key, date, events: [] };
      map.set(key, group);
      groups.push(group);
    }
    group.events.push(event);
  }
  return groups;
}

function TimelineEventCard({ event, userId, organizer, onOpen }) {
  const {
    count, interesados, cupoLleno,
    cuposRestantes, pocosCupos, sinCupos,
  } = useInteres(event, userId);

  return (
    <div className={styles.timelineCard} onClick={() => onOpen(event)} role="button" tabIndex={0}>
      <div className={styles.timelineCardBody}>
        <div className={styles.timelineCardHeader}>
          {event.fecha_in && (
            <span className={styles.timelineCardTime}>{formatTime(event.fecha_in)}</span>
          )}
          {event.categoria && (
            <span className={styles.timelineCardCategory}>{event.categoria}</span>
          )}
        </div>

        <h3 className={styles.timelineCardTitle}>{event.titulo}</h3>

        {organizer && (
          <div className={styles.timelineCardRow}>
            {organizer.foto_url ? (
              <img src={organizer.foto_url} alt={organizer.nombre} className={styles.timelineOrgAvatar} />
            ) : (
              <span
                className={styles.timelineOrgAvatarFallback}
                style={{ background: FALLBACK_COLORS[0] }}
              >
                {getInitials(organizer.nombre)}
              </span>
            )}
            <span className={styles.timelineCardText}>Por {organizer.nombre}</span>
          </div>
        )}

        {event.ubicacion && (
          <div className={styles.timelineCardRow}>
            <MapPin size={14} className={styles.timelineCardIcon} />
            <span className={styles.timelineCardText}>{event.ubicacion}</span>
          </div>
        )}

        <div className={styles.timelineCardFooter}>
          <InteresadosAvatars
            interesados={interesados}
            extraCount={Math.max(0, count - interesados.length)}
          />
          {(pocosCupos || sinCupos) && (
            <span className={styles.cuposBadge}>
              {sinCupos ? 'Cupo lleno' : `¡Quedan ${cuposRestantes} cupos!`}
            </span>
          )}
        </div>

        {cupoLleno && (
          <p className={styles.cupoLlenoMsg}>Este evento ya alcanzó su cupo máximo.</p>
        )}
      </div>

      {event.imagen_url ? (
        <img src={event.imagen_url} alt={event.titulo} className={styles.timelineCardImage} />
      ) : (
        <div className={styles.timelineCardImagePlaceholder} />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [query, setQuery]                   = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [events, setEvents]                 = useState([]);
  const [organizers, setOrganizers]         = useState({});
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selectedEvent, setSelectedEvent]   = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // Apply category filter passed via navigation state (from sidebar/bottom-nav)
  useEffect(() => {
    setActiveCategory(location.state?.categoria ?? null);
  }, [location.state]);

  function handleSearchChange(e) {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 400);
  }

  function handleClear() {
    clearTimeout(debounceRef.current);
    setQuery('');
    setDebouncedQuery('');
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetch = debouncedQuery.trim()
      ? searchEvents({ query: debouncedQuery.trim(), categoria: activeCategory })
      : getActiveEvents({ categoria: activeCategory });
    fetch
      .then((data) => {
        setEvents(data);
        const autorIds = (data ?? []).map(ev => ev.autor_id);
        getUsuariosByIds(autorIds).then(setOrganizers).catch(() => setOrganizers({}));
      })
      .catch(() => setError('No se pudieron cargar los eventos.'))
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedQuery]);

  const dateGroups = groupEventsByDate(events);

  return (
    <AppShell activeCategory={activeCategory}>
      <div className={styles.content}>
        <div className={styles.feedColumn}>

          {/* Search */}
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar eventos..."
              value={query}
              onChange={handleSearchChange}
            />
            {query && (
              <button className={styles.clearBtn} onClick={handleClear} type="button">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category filter tabs */}
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab.id ?? 'all'}
                className={`${styles.tab} ${activeCategory === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveCategory(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* States */}
          {loading && (
            <div className={styles.center}>
              <p>Cargando eventos...</p>
            </div>
          )}

          {error && (
            <div className={styles.center}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className={styles.empty}>
              {debouncedQuery.trim() ? (
                <p>No se encontraron eventos.</p>
              ) : (
                <>
                  <p>No hay eventos activos por ahora.</p>
                  <button
                    className={styles.createBtn}
                    onClick={() => navigate('/crear-evento')}
                    type="button"
                  >
                    Publicar el primero
                  </button>
                </>
              )}
            </div>
          )}

          {/* Timeline */}
          {!loading && !error && events.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Eventos cercanos</h2>
              <div className={styles.timeline}>
                {dateGroups.map(group => {
                  const { dayMonth, weekday } = formatDayLabel(group.date);
                  return (
                    <div className={styles.timelineGroup} key={group.key}>
                      <div className={styles.timelineMarker}>
                        <span className={styles.timelineDot} />
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineDateLabel}>
                          <span className={styles.timelineDateDay}>{dayMonth}</span>
                          <span className={styles.timelineWeekday}>{weekday}</span>
                        </div>
                        <div className={styles.timelineCards}>
                          {group.events.map(event => (
                            <TimelineEventCard
                              key={event.id}
                              event={event}
                              userId={user?.id}
                              organizer={organizers[event.autor_id]}
                              onOpen={setSelectedEvent}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <aside className={styles.calendarColumn}>
          <SavedEventsCalendar />
        </aside>
      </div>

      {selectedEvent && (
        <EventDrawer
          event={selectedEvent}
          organizer={organizers[selectedEvent.autor_id]}
          userId={user?.id}
          isAdmin={profile?.role === 'admin'}
          onClose={() => setSelectedEvent(null)}
          onDeleted={(id) => setEvents(prev => prev.filter(ev => ev.id !== id))}
        />
      )}
    </AppShell>
  );
}
