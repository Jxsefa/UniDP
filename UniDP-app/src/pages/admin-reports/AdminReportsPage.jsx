import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flag, CheckCircle2, XCircle,
} from 'lucide-react';
import { getReportes, updateReporteEstado } from '../../services/reportes.service';
import { getEventosByIds, deleteEvent } from '../../services/events.service';
import { getUsuariosByIds } from '../../services/auth.service';
import { createNotificacionReporte } from '../../services/notificaciones.service';
import Spinner from '../../components/ui/Spinner';
import styles from './AdminReportsPage.module.css';

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'aceptado', label: 'Aceptadas' },
  { id: 'rechazado', label: 'Rechazadas' },
];

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptada',
  rechazado: 'Rechazada',
};

const ESTADO_BADGE_CLASS = {
  pendiente: 'estadoPendiente',
  aceptado: 'estadoAceptado',
  rechazado: 'estadoRechazado',
};

function formatFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [eventos, setEventos] = useState({});
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [actingId, setActingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function load() {
    setLoading(true);
    setError(null);
    getReportes()
      .then(async (data) => {
        setReportes(data);
        const eventosById = await getEventosByIds(data.map(r => r.evento_id));
        const userIds = [
          ...data.map(r => r.reportador_id),
          ...Object.values(eventosById).map(e => e.autor_id),
        ];
        const usuariosById = await getUsuariosByIds(userIds);
        setEventos(eventosById);
        setUsuarios(usuariosById);
      })
      .catch(() => setError('No se pudieron cargar las denuncias.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAceptarReporte(reporte) {
    setActingId(reporte.id);
    try {
      const evento = eventos[reporte.evento_id];
      const eventoTitulo = evento?.titulo || 'el evento denunciado';
      await updateReporteEstado(reporte.id, 'aceptado');
      await createNotificacionReporte({
        usuarioId: reporte.reportador_id,
        tipo: 'reporte_aceptado',
        titulo: 'Gracias por tu reporte',
        mensaje: `Revisamos tu denuncia sobre "${eventoTitulo}" y confirmamos que infringía nuestras normas comunitarias. Gracias por ayudarnos a mantener UniDP un espacio seguro para toda la comunidad.`,
        reporteId: reporte.id,
      });
      if (evento?.autor_id) {
        await createNotificacionReporte({
          usuarioId: evento.autor_id,
          tipo: 'evento_eliminado',
          titulo: 'Tu evento fue eliminado',
          mensaje: `Tu evento "${eventoTitulo}" fue eliminado luego ya que infringía nuestras normas comunitarias.`,
          reporteId: reporte.id,
        });
      }
      if (evento) await deleteEvent(evento.id);
      setReportes(prev => prev.map(r => (r.id === reporte.id ? { ...r, estado: 'aceptado' } : r)));
      setToast({ type: 'success', message: 'Denuncia aceptada y evento eliminado.' });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'No se pudo aceptar la denuncia.' });
    } finally {
      setActingId(null);
    }
  }

  async function handleRechazarReporte(reporte) {
    setActingId(reporte.id);
    try {
      const evento = eventos[reporte.evento_id];
      const eventoTitulo = evento?.titulo || 'el evento denunciado';
      await updateReporteEstado(reporte.id, 'rechazado');
      setReportes(prev => prev.map(r => (r.id === reporte.id ? { ...r, estado: 'rechazado' } : r)));
      setToast({ type: 'success', message: 'Denuncia rechazada.' });
      createNotificacionReporte({
        usuarioId: reporte.reportador_id,
        tipo: 'reporte_rechazado',
        titulo: 'Revisamos tu denuncia',
        mensaje: `Revisamos tu denuncia sobre "${eventoTitulo}" y, concluimos que no infringe nuestras normas comunitarias. Gracias por seguir ayudándonos a cuidar la comunidad.`,
        reporteId: reporte.id,
        eventoId: evento?.id ?? null,
      }).catch(err => console.error('No se pudo crear la notificación:', err));
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'No se pudo rechazar la denuncia.' });
    } finally {
      setActingId(null);
    }
  }

  const displayedReportes = filter === 'todas'
    ? reportes
    : reportes.filter(r => r.estado === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Flag size={22} />
          Panel de denuncias
        </h1>
      </div>

      <div className={styles.tabs}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`${styles.tab} ${filter === f.id ? styles.tabActive : ''}`}
            onClick={() => setFilter(f.id)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {error && <div className={styles.center}><p>{error}</p></div>}

      {!loading && !error && displayedReportes.length === 0 && (
        <div className={styles.empty}>
          <Flag size={40} strokeWidth={1.5} />
          <p>No hay denuncias para mostrar.</p>
        </div>
      )}

      {!loading && !error && displayedReportes.length > 0 && (
        <div className={styles.list}>
          {displayedReportes.map((reporte) => {
            const evento = eventos[reporte.evento_id];
            const reportador = usuarios[reporte.reportador_id];
            const organizador = evento ? usuarios[evento.autor_id] : null;

            return (
              <div key={reporte.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.estadoBadge} ${styles[ESTADO_BADGE_CLASS[reporte.estado]]}`}>
                    {ESTADO_LABELS[reporte.estado] ?? reporte.estado}
                  </span>
                  <span className={styles.fecha}>{formatFecha(reporte.creado_en)}</span>
                </div>

                <div className={styles.cardBody}>
                  {evento?.imagen_url && (
                    <img src={evento.imagen_url} alt={evento.titulo} className={styles.thumb} />
                  )}
                  <div className={styles.cardInfo}>
                    <button
                      className={styles.eventTitle}
                      onClick={() => evento && navigate(`/evento/${evento.id}/editar`)}
                      type="button"
                      disabled={!evento}
                    >
                      {evento?.titulo || 'Evento eliminado'}
                    </button>
                    {evento?.categoria && <span className={styles.category}>{evento.categoria}</span>}
                    {organizador && (
                      <p className={styles.metaText}>Organizado por {organizador.nombre}</p>
                    )}

                    <div className={styles.motivoRow}>
                      <span className={styles.motivoBadge}>{reporte.motivo}</span>
                    </div>
                    {reporte.descripcion && (
                      <p className={styles.descripcion}>{reporte.descripcion}</p>
                    )}

                    <p className={styles.metaText}>
                      Denunciado por {reportador?.nombre || 'Usuario desconocido'}
                    </p>
                  </div>
                </div>

                {reporte.estado === 'pendiente' && (
                  <div className={styles.cardActions}>
                    <button
                      className={styles.acceptBtn}
                      onClick={() => handleAceptarReporte(reporte)}
                      disabled={actingId === reporte.id}
                      type="button"
                    >
                      <CheckCircle2 size={15} />
                      Aceptar denuncia
                    </button>
                    <button
                      className={styles.discardBtn}
                      onClick={() => handleRechazarReporte(reporte)}
                      disabled={actingId === reporte.id}
                      type="button"
                    >
                      <XCircle size={15} />
                      Descartar denuncia
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
