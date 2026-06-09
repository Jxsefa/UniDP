import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveEvents, searchEvents } from '../../services/events.service';
import { CATEGORIES } from '../../constants/categories';
import styles from './DashboardPage.module.css';

const ALL_TAB = { id: null, label: 'Todos', icon: 'apps' };
const TABS = [ALL_TAB, ...CATEGORIES];

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [query, setQuery]               = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

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

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.topBar}>
          <h1 className={styles.title}>Eventos</h1>
          <button className={styles.createBtn} onClick={() => navigate('/crear-evento')}>
            <span className="material-symbols-outlined">add</span>
            Crear evento
          </button>
        </div>

        <div className={styles.searchBar}>
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar eventos..."
            value={query}
            onChange={handleSearchChange}
          />
          {query && (
            <button className={styles.clearBtn} onClick={handleClear}>
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.id ?? 'all'}
              className={`${styles.tab} ${activeCategory === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(tab.id)}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className={styles.center}>
            <span className="material-symbols-outlined">hourglass_empty</span>
            <p>Cargando eventos...</p>
          </div>
        )}

        {error && (
          <div className={styles.center}>
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className={styles.empty}>
            <span className="material-symbols-outlined">
              {debouncedQuery.trim() ? 'search_off' : 'event_busy'}
            </span>
            {debouncedQuery.trim() ? (
              <p>No se encontraron eventos.</p>
            ) : (
              <>
                <p>No hay eventos activos por ahora.</p>
                <button className={styles.createBtn} onClick={() => navigate('/crear-evento')}>
                  Publicar el primero
                </button>
              </>
            )}
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className={styles.grid}>
            {events.map(event => (
              <div key={event.id} className={styles.card}>
                {event.imagen_url && (
                  <img src={event.imagen_url} alt={event.titulo} className={styles.cardImage} />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <span className={styles.category}>{event.categoria}</span>
                    <span className={styles.duration}>{event.duracion}</span>
                  </div>
                  <h2 className={styles.cardTitle}>{event.titulo}</h2>
                  <p className={styles.cardDesc}>{event.descripcion}</p>
                  <div className={styles.cardFooter}>
                    {event.fecha_in && (
                      <div className={styles.footerRow}>
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span>{formatDate(event.fecha_in)}</span>
                      </div>
                    )}
                    <div className={styles.footerRow}>
                      <span className="material-symbols-outlined">location_on</span>
                      <span>{event.ubicacion}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
