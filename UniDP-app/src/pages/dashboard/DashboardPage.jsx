import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Calendar, GraduationCap, Users, Users2, Trophy,
  Search, X, MapPin, Plus,
} from 'lucide-react';
import {
  getActiveEvents, searchEvents,
  toggleInteres, checkInteres, getInteresCount, getInteresados,
} from '../../services/events.service';
import { getUsuariosByIds } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES } from '../../constants/categories';
import styles from './DashboardPage.module.css';

const ALL_TAB = { id: null, label: 'Todos' };
const TABS = [ALL_TAB, ...CATEGORIES];

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

function formatTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

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

const FALLBACK_COLORS = ['#b70006', '#5e3f3a', '#936e69'];

function getInitials(nombre) {
  const parts = (nombre || '').trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (nombre || '').slice(0, 2).toUpperCase();
}

function InteresadosAvatars({ interesados, extraCount }) {
  if (!interesados.length) return null;
  return (
    <div className={styles.avatarStack}>
      {interesados.map((u, i) => (
        u.foto_url ? (
          <img
            key={u.id}
            src={u.foto_url}
            alt={u.nombre}
            className={styles.miniAvatar}
          />
        ) : (
          <div
            key={u.id}
            className={styles.miniAvatar}
            style={{ background: FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
          >
            <span className={styles.miniAvatarInitials}>{getInitials(u.nombre)}</span>
          </div>
        )
      ))}
      {extraCount > 0 && (
        <div className={`${styles.miniAvatar} ${styles.miniAvatarMore}`}>
          <span className={styles.miniAvatarInitials}>+{extraCount}</span>
        </div>
      )}
    </div>
  );
}

function TimelineEventCard({ event, userId, organizer }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [interesados, setInteresados] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      userId ? checkInteres(userId, event.id) : Promise.resolve(false),
      getInteresCount(event.id),
      getInteresados(event.id),
    ]).then(([isLiked, cnt, users]) => {
      setLiked(isLiked);
      setCount(cnt);
      setInteresados(users);
    }).catch(() => {});
  }, [userId, event.id]);

  async function handleToggle() {
    if (!userId || busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setCount(c => c + (next ? 1 : -1));
    try {
      await toggleInteres(userId, event.id);
      const users = await getInteresados(event.id);
      setInteresados(users);
    } catch {
      setLiked(!next);
      setCount(c => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.timelineCard}>
      <img
        src={event.imagen_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'}
        alt={event.titulo}
        className={styles.timelineCardImage}
      />

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
          <button
            className={`${styles.interestBtn} ${liked ? styles.interestBtnActive : ''}`}
            onClick={handleToggle}
            disabled={busy}
            type="button"
          >
            {liked ? 'Me interesa ♥' : 'Me interesa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [query, setQuery]                   = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [events, setEvents]                 = useState([]);
  const [organizers, setOrganizers]         = useState({});
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
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

  function handleNavClick({ path, categoria }) {
    if (categoria) {
      navigate(path, { state: { categoria } });
    } else {
      navigate(path);
    }
  }

  // Active when on the right path; for /dashboard items also match the active category.
  function isNavActive({ path, categoria }) {
    if (location.pathname !== path) return false;
    if (path === '/dashboard') return (categoria ?? null) === activeCategory;
    return true;
  }

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

      {/* ── Main content ── */}
      <main className={styles.main}>
        <div className={styles.content}>

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
