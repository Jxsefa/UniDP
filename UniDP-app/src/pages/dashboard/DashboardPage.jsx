import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Calendar, GraduationCap, Users, Users2, Trophy,
  Search, X, MapPin, Plus,
} from 'lucide-react';
import { getActiveEvents, searchEvents } from '../../services/events.service';
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

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function PlaceholderAvatars() {
  const colors = ['#b70006', '#5e3f3a', '#936e69'];
  return (
    <div className={styles.avatarStack}>
      {colors.map((bg, i) => (
        <div key={i} className={styles.miniAvatar} style={{ background: bg }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [query, setQuery]                   = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [events, setEvents]                 = useState([]);
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
      .then(setEvents)
      .catch(() => setError('No se pudieron cargar los eventos.'))
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedQuery]);

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

          {/* Event cards */}
          {!loading && !error && events.length > 0 && (
            <div className={styles.grid}>
              {events.map(event => (
                <div key={event.id} className={styles.card}>
                  <div className={styles.cardImageWrap}>
                    {event.imagen_url ? (
                      <img
                        src={event.imagen_url}
                        alt={event.titulo}
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.cardImagePlaceholder} />
                    )}
                    {event.categoria && (
                      <span className={styles.cardBadge}>{event.categoria}</span>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    {event.categoria && (
                      <span className={styles.category}>{event.categoria}</span>
                    )}
                    <h2 className={styles.cardTitle}>{event.titulo}</h2>

                    <div className={styles.cardMeta}>
                      {event.fecha_in && (
                        <div className={styles.metaRow}>
                          <Calendar size={14} />
                          <span>{formatDate(event.fecha_in)}</span>
                        </div>
                      )}
                      {event.ubicacion && (
                        <div className={styles.metaRow}>
                          <MapPin size={14} />
                          <span>{event.ubicacion}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <PlaceholderAvatars />
                      <button className={styles.interestBtn} type="button">
                        Me interesa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
