import { useEffect, useState } from 'react';
import {
  Bell, CheckCircle2, XCircle, Trash2, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  getNotificaciones, markNotificacionLeida, markTodasLeidas, deleteNotificacion,
} from '../../services/notificaciones.service';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import styles from './NotificationsPage.module.css';

const TIPO_ICON = {
  reporte_aceptado: CheckCircle2,
  reporte_rechazado: XCircle,
  evento_eliminado: Trash2,
};

const TIPO_ICON_CLASS = {
  reporte_aceptado: 'iconSuccess',
  reporte_rechazado: 'iconMuted',
  evento_eliminado: 'iconError',
};

function formatFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-CL', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getNotificaciones(user.id)
      .then(setNotificaciones)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  async function handleNotifClick(notif) {
    if (notif.leido) return;
    setNotificaciones(prev => prev.map(n => (n.id === notif.id ? { ...n, leido: true } : n)));
    markNotificacionLeida(notif.id).catch(console.error);
  }

  async function handleMarcarTodas() {
    if (!user || unreadCount === 0) return;
    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    markTodasLeidas(user.id).catch(console.error);
  }

  async function handleDelete(notif) {
    setNotificaciones(prev => prev.filter(n => n.id !== notif.id));
    deleteNotificacion(notif.id).catch(console.error);
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <Bell size={22} />
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={handleMarcarTodas} type="button">
              Marcar todas como leídas
            </button>
          )}
        </div>

        {loading && <Spinner />}

        {!loading && notificaciones.length === 0 && (
          <div className={styles.empty}>
            <Bell size={40} strokeWidth={1.5} />
            <p>No tienes notificaciones.</p>
          </div>
        )}

        {!loading && notificaciones.length > 0 && (
          <div className={styles.list}>
            {notificaciones.map((notif) => {
              const Icon = TIPO_ICON[notif.tipo] ?? Bell;
              return (
                <div
                  key={notif.id}
                  className={`${styles.item} ${!notif.leido ? styles.itemUnread : ''}`}
                  onClick={() => handleNotifClick(notif)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNotifClick(notif); }}
                >
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif); }}
                    aria-label="Eliminar notificación"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                  <Icon size={20} className={styles[TIPO_ICON_CLASS[notif.tipo]] ?? styles.iconMuted} />
                  <span className={styles.itemBody}>
                    <span className={styles.itemTitle}>{notif.titulo}</span>
                    {notif.mensaje && <span className={styles.itemMessage}>{notif.mensaje}</span>}
                    <span className={styles.itemDate}>{formatFecha(notif.creado_en)}</span>
                  </span>
                  {!notif.leido && <span className={styles.dot} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
