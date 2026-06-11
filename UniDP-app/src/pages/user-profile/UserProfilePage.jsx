import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, MapPin, ArrowLeft,
} from 'lucide-react';
import { getUserProfile } from '../../services/auth.service';
import { getEventosByAutor, getEventosPasados, getEventosAsistidos } from '../../services/events.service';
import Spinner from '../../components/ui/Spinner';
import AppShell from '../../components/layout/AppShell';
import styles from '../profile/ProfilePage.module.css';

const TABS = [
  { id: 'eventos', label: 'Eventos' },
  { id: 'pasados', label: 'Eventos pasados' },
];

const EMPTY_MESSAGES = {
  eventos: 'Este usuario no ha creado eventos.',
  pasados: 'No tiene eventos pasados.',
};

function getInitials(profile) {
  const name = profile?.nombre || '';
  const parts = name.split(/[\s@]/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('eventos');
  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [asistidos, setAsistidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getUserProfile(id),
      getEventosByAutor(id),
      getEventosPasados(id),
      getEventosAsistidos(id),
    ])
      .then(([prof, evs, past, asistidos]) => {
        if (!prof) {
          setError('No se encontró este usuario.');
          return;
        }
        setProfile(prof);
        setEvents(evs ?? []);
        setPastEvents(past ?? []);
        setAsistidos(asistidos ?? []);
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  }, [id]);

  const avatarUrl = profile?.foto_url;
  const initials = getInitials(profile);

  const tabEvents = {
    eventos: events,
    pasados: pastEvents,
  };
  const currentEvents = tabEvents[activeTab] || [];

  return (
    <AppShell>
      <div className={styles.content}>

          <button
            className={styles.editBtn}
            onClick={() => navigate(-1)}
            type="button"
            style={{ marginBottom: '1.25rem' }}
          >
            <ArrowLeft size={15} />
            Volver
          </button>

          {loading && <Spinner />}

          {!loading && error && (
            <div className={styles.empty}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className={styles.headerGrid}>
                <div className={styles.profileCard}>
                  <div className={styles.avatarWrap}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profile.nombre} className={styles.avatar} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <span>{initials}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.profileInfo}>
                    <h1 className={styles.profileName}>{profile?.nombre}</h1>
                    <p className={styles.profileBio}>
                      {profile?.biografia || 'Sin biografía'}
                    </p>
                  </div>
                </div>

                <div className={styles.statsCard}>
                  <h2 className={styles.statsTitle}>Estadísticas</h2>
                  <div className={styles.statsList}>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{events.length}</span>
                      <span className={styles.statLabel}>Eventos creados</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{asistidos.length}</span>
                      <span className={styles.statLabel}>Eventos asistidos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.tabs}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {currentEvents.length === 0 ? (
                <div className={styles.empty}>
                  <Calendar size={40} strokeWidth={1.5} />
                  <p>{EMPTY_MESSAGES[activeTab]}</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {currentEvents.map(event => (
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
                        {activeTab === 'pasados' && (
                          <span className={styles.expiredBadge}>Expirado</span>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
      </div>
    </AppShell>
  );
}
