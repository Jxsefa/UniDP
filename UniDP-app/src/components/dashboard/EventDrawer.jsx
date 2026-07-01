import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Users as UsersIcon, Trash2, Flag, CalendarPlus } from 'lucide-react';
import { useInteres } from '../../hooks/useInteres';
import { deleteEvent } from '../../services/events.service';
import { createReporte } from '../../services/reportes.service';
import { REPORT_MOTIVOS } from '../../constants/reportMotivos';
import {
  FALLBACK_COLORS, formatDateBadge, formatWeekdayDate, formatTimeRange, getInitials, buildGoogleCalendarUrl,
} from '../../utils/eventFormat';
import InteresadosAvatars from './InteresadosAvatars';
import styles from './EventDrawer.module.css';

export default function EventDrawer({ event, organizer, userId, isAdmin, onClose, onDeleted }) {
  const navigate = useNavigate();
  const {
    liked, count, interesados, busy, cupoLleno, toggle,
    cupos, cuposRestantes, pocosCupos, sinCupos,
  } = useInteres(event, userId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState(REPORT_MOTIVOS[0]);
  const [reportDescripcion, setReportDescripcion] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportDone, setReportDone] = useState(false);

  // TODO: restringir a `event.autor_id !== userId` antes de producción (no auto-denuncias).
  const canReport = !!userId;

  const dateBadge = formatDateBadge(event.fecha_in);

  function openReport() {
    setReportMotivo(REPORT_MOTIVOS[0]);
    setReportDescripcion('');
    setReportError(null);
    setReportDone(false);
    setReportOpen(true);
  }

  async function handleReportSubmit() {
    setReportSubmitting(true);
    setReportError(null);
    try {
      await createReporte({
        eventoId: event.id,
        reportadorId: userId,
        motivo: reportMotivo,
        descripcion: reportDescripcion,
      });
      setReportDone(true);
    } catch (err) {
      console.error(err);
      setReportError(
        err.message === 'YA_DENUNCIADO'
          ? 'Ya enviaste una denuncia para este evento.'
          : 'No se pudo enviar la denuncia. Intenta nuevamente.',
      );
    } finally {
      setReportSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteEvent(event.id);
      onDeleted?.(event.id);
      onClose();
    } catch (err) {
      console.error(err);
      setDeleteError('No se pudo eliminar el evento. Verifica los permisos.');
      setDeleting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        <div className={styles.topBar}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar" type="button">
            <X size={18} />
          </button>
          {event.categoria && <span className={styles.category}>{event.categoria}</span>}
          <div className={styles.topBarActions}>
            {canReport && (
              <button
                className={styles.reportBtn}
                onClick={openReport}
                aria-label="Denunciar evento"
                type="button"
              >
                <Flag size={16} />
              </button>
            )}
            {isAdmin && (
              <button
                className={styles.deleteBtn}
                onClick={() => setConfirmDelete(true)}
                aria-label="Eliminar evento"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {event.imagen_url ? (
            <img src={event.imagen_url} alt={event.titulo} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder} />
          )}

          <div className={styles.body}>
            <h2 className={styles.title}>{event.titulo}</h2>

            {organizer && (
              <div
                className={styles.row}
                onClick={() => navigate(`/usuario/${organizer.id}`)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                {organizer.foto_url ? (
                  <img src={organizer.foto_url} alt={organizer.nombre} className={styles.orgAvatar} />
                ) : (
                  <span className={styles.orgAvatarFallback} style={{ background: FALLBACK_COLORS[0] }}>
                    {getInitials(organizer.nombre)}
                  </span>
                )}
                <span className={styles.rowText}>Organizado por {organizer.nombre}</span>
              </div>
            )}

            {event.fecha_in && (
              <div className={styles.row}>
                {dateBadge && (
                  <div className={styles.dateBadge}>
                    <span className={styles.dateBadgeMonth}>{dateBadge.month}</span>
                    <span className={styles.dateBadgeDay}>{dateBadge.day}</span>
                  </div>
                )}
                <div className={styles.dateText}>
                  <span className={styles.dateTextMain}>{formatWeekdayDate(event.fecha_in)}</span>
                  <span className={styles.dateTextSub}>{formatTimeRange(event.fecha_in, event.fecha_fin)}</span>
                </div>
              </div>
            )}

            {event.ubicacion && (
              <div className={styles.row}>
                <div className={styles.iconBadge}>
                  <MapPin size={18} />
                </div>
                <span className={styles.rowText}>{event.ubicacion}</span>
              </div>
            )}

            {event.fecha_in && (
              <a
                className={styles.gcalLink}
                href={buildGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CalendarPlus size={16} />
                Agregar a Google Calendar
              </a>
            )}

            {cupos != null && (
              <div className={styles.row}>
                <div className={styles.iconBadge}>
                  <UsersIcon size={18} />
                </div>
                <span className={styles.rowText}>{count} / {cupos} cupos ocupados</span>
                {(pocosCupos || sinCupos) && (
                  <span className={styles.cuposBadge}>
                    {sinCupos ? 'Cupo lleno' : `¡Quedan ${cuposRestantes}!`}
                  </span>
                )}
              </div>
            )}

            {event.descripcion && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Descripción</h3>
                <p className={styles.description}>{event.descripcion}</p>
              </div>
            )}

            <div className={styles.footer}>
              <InteresadosAvatars
                interesados={interesados}
                extraCount={Math.max(0, count - interesados.length)}
              />
              <button
                className={`${styles.interestBtn} ${liked ? styles.interestBtnActive : ''}`}
                onClick={toggle}
                disabled={busy || (sinCupos && !liked)}
                type="button"
              >
                {liked ? 'Inscrito' : (sinCupos ? 'Cupo lleno' : 'Inscribirse')}
              </button>
            </div>

            {cupoLleno && (
              <p className={styles.cupoLlenoMsg}>Este evento ya alcanzó su cupo máximo.</p>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => !deleting && setConfirmDelete(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Eliminar evento</h2>
            <p className={styles.modalText}>
              ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <p className={styles.modalText} style={{ color: 'var(--color-error)' }}>{deleteError}</p>
            )}
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className={styles.deleteConfirmBtn}
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className={styles.modalOverlay} onClick={() => !reportSubmitting && setReportOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {reportDone ? (
              <>
                <h2 className={styles.modalTitle}>Denuncia enviada</h2>
                <p className={styles.modalText}>
                  Gracias por tu reporte. Nuestro equipo lo revisará a la brevedad.
                </p>
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelBtn}
                    type="button"
                    onClick={() => setReportOpen(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className={styles.modalTitle}>Denunciar evento</h2>
                <p className={styles.modalText}>
                  Cuéntanos qué ocurre con &quot;{event.titulo}&quot;. Tu denuncia será revisada por un administrador.
                </p>

                <label className={styles.fieldLabel}>Motivo</label>
                <select
                  className={styles.fieldSelect}
                  value={reportMotivo}
                  onChange={e => setReportMotivo(e.target.value)}
                  disabled={reportSubmitting}
                >
                  {REPORT_MOTIVOS.map(motivo => (
                    <option key={motivo} value={motivo}>{motivo}</option>
                  ))}
                </select>

                <label className={styles.fieldLabel}>Descripción (opcional)</label>
                <textarea
                  className={styles.fieldTextarea}
                  value={reportDescripcion}
                  onChange={e => setReportDescripcion(e.target.value)}
                  placeholder="Agrega detalles que ayuden a revisar tu denuncia..."
                  rows={3}
                  disabled={reportSubmitting}
                />

                {reportError && (
                  <p className={styles.modalText} style={{ color: 'var(--color-error)' }}>{reportError}</p>
                )}

                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelBtn}
                    type="button"
                    onClick={() => setReportOpen(false)}
                    disabled={reportSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.deleteConfirmBtn}
                    type="button"
                    onClick={handleReportSubmit}
                    disabled={reportSubmitting}
                  >
                    {reportSubmitting ? 'Enviando…' : 'Enviar denuncia'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
