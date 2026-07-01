import { useEffect, useRef, useState } from 'react';
import {
  Bell, CheckCircle2, XCircle, Trash2, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  getNotificaciones, getUnreadCount, markNotificacionLeida, markTodasLeidas, deleteNotificacion,
} from '../../services/notificaciones.service';
import styles from './NotificationBell.module.css';

const POLL_INTERVAL_MS = 45000;

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

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    getUnreadCount(user.id).then(setUnreadCount).catch(console.error);
    const timer = setInterval(() => {
      getUnreadCount(user.id).then(setUnreadCount).catch(console.error);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [user]);

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

  function handleToggle() {
    if (!open && user) {
      setLoading(true);
      getNotificaciones(user.id)
        .then(setNotificaciones)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    setOpen(prev => !prev);
  }

  async function handleNotifClick(notif) {
    if (notif.leido) return;
    setNotificaciones(prev => prev.map(n => (n.id === notif.id ? { ...n, leido: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
    markNotificacionLeida(notif.id).catch(console.error);
  }

  async function handleMarcarTodas() {
    if (!user || unreadCount === 0) return;
    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    setUnreadCount(0);
    markTodasLeidas(user.id).catch(console.error);
  }

  async function handleDelete(notif) {
    setNotificaciones(prev => prev.filter(n => n.id !== notif.id));
    if (!notif.leido) setUnreadCount(prev => Math.max(0, prev - 1));
    deleteNotificacion(notif.id).catch(console.error);
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.iconBtn}
        aria-label="Notificaciones"
        onClick={handleToggle}
        type="button"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Notificaciones</span>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={handleMarcarTodas} type="button">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading && <p className={styles.empty}>Cargando…</p>}

            {!loading && notificaciones.length === 0 && (
              <p className={styles.empty}>No tienes notificaciones.</p>
            )}

            {!loading && notificaciones.map((notif) => {
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
                    <X size={14} />
                  </button>
                  <Icon size={18} className={styles[TIPO_ICON_CLASS[notif.tipo]] ?? styles.iconMuted} />
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
        </div>
      )}
    </div>
  );
}
