import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveEvents } from '../../services/events.service';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getActiveEvents()
      .then(setEvents)
      .catch(() => setError('No se pudieron cargar los eventos.'))
      .finally(() => setLoading(false));
  }, []);

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
            <span className="material-symbols-outlined">event_busy</span>
            <p>No hay eventos activos por ahora.</p>
            <button className={styles.createBtn} onClick={() => navigate('/crear-evento')}>
              Publicar el primero
            </button>
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
                    <span className="material-symbols-outlined">location_on</span>
                    <span>{event.ubicacion}</span>
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
