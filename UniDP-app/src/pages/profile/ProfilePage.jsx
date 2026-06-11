import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Camera, Edit, MapPin, Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateProfile } from '../../services/auth.service';
import {
  getEventosByAutor,
  getEventosMeInteresa,
  getEventosPasados,
  getEventosAsistidos,
  toggleInteres,
  deleteEvent,
} from '../../services/events.service';
import Spinner from '../../components/ui/Spinner';
import AppShell from '../../components/layout/AppShell';
import styles from './ProfilePage.module.css';

const TABS = [
  { id: 'mis-eventos', label: 'Mis eventos' },
  { id: 'me-interesa', label: 'Me interesa' },
  { id: 'pasados',     label: 'Eventos pasados' },
  { id: 'historial',   label: 'Historial asistido' },
];

const EMPTY_MESSAGES = {
  'mis-eventos': 'No has creado ningún evento aún.',
  'me-interesa': 'No tienes eventos guardados. ¡Explora el feed!',
  'pasados':     'No tienes eventos pasados.',
  'historial':   'Aún no tienes eventos en tu historial de asistencia.',
};

function getInitials(user, profile) {
  const name = profile?.nombre || user?.user_metadata?.full_name || user?.email || '';
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

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const navigate    = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile]         = useState(null);
  const [activeTab, setActiveTab]     = useState('mis-eventos');
  const [myEvents, setMyEvents]       = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [pastEvents, setPastEvents]   = useState([]);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editOpen, setEditOpen]       = useState(false);

  const [editBio, setEditBio]         = useState('');
  const [editFoto, setEditFoto]       = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getUserProfile(user.id),
      getEventosByAutor(user.id),
      getEventosMeInteresa(user.id),
      getEventosPasados(user.id),
      getEventosAsistidos(user.id),
    ])
      .then(([prof, myEvs, saved, past, history]) => {
        setProfile(prof);
        setMyEvents(myEvs ?? []);
        setSavedEvents((saved ?? []).filter(Boolean));
        setPastEvents(past ?? []);
        setHistoryEvents((history ?? []).filter(Boolean));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  function openEdit() {
    setEditBio(profile?.biografia || '');
    setEditFoto(null);
    setEditPreview(null);
    setEditOpen(true);
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditFoto(file);
    const reader = new FileReader();
    reader.onload = ev => setEditPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        biografia: editBio.trim(),
        fotoFile:  editFoto || undefined,
      });
      const updated = await getUserProfile(user.id);
      setProfile(updated);
      refreshProfile();
      setEditOpen(false);
      setToast({ type: 'success', message: 'Perfil actualizado correctamente' });
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      setToast({ type: 'error', message: 'No se pudo guardar el perfil' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEvent() {
    if (!deleteTarget) return;
    setDeletingEvent(true);
    try {
      await deleteEvent(deleteTarget);
      setMyEvents(prev => prev.filter(ev => ev?.id !== deleteTarget));
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Evento eliminado correctamente' });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'No se pudo eliminar el evento' });
    } finally {
      setDeletingEvent(false);
    }
  }

  async function handleQuitarInteres(eventoId) {
    if (!user) return;
    try {
      await toggleInteres(user.id, eventoId);
      setSavedEvents(prev => prev.filter(ev => ev?.id !== eventoId));
    } catch (err) {
      console.error(err);
    }
  }

  const displayName = profile?.nombre || user?.user_metadata?.full_name || user?.email || '';
  const avatarUrl   = profile?.foto_url || user?.user_metadata?.avatar_url;
  const initials    = getInitials(user, profile);

  const tabEvents = {
    'mis-eventos': myEvents,
    'me-interesa': savedEvents,
    'pasados':     pastEvents,
    'historial':   historyEvents,
  };
  const currentEvents = tabEvents[activeTab] || [];

  /* ── Render ────────────────────────────────────────────── */
  return (
    <AppShell>
      <div className={styles.content}>

          {loading && <Spinner />}

          {!loading && (
            <>
              {/* ── Header grid ── */}
              <div className={styles.headerGrid}>

                {/* Profile card */}
                <div className={styles.profileCard}>
                  <div className={styles.avatarWrap}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Foto de perfil" className={styles.avatar} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <span>{initials}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.profileInfo}>
                    <h1 className={styles.profileName}>{displayName}</h1>
                    <p className={styles.profileEmail}>{user?.email}</p>
                    <p className={styles.profileBio}>
                      {profile?.biografia || 'Sin biografía'}
                    </p>
                    <button
                      className={styles.editBtn}
                      onClick={openEdit}
                      type="button"
                    >
                      <Edit size={15} />
                      Editar perfil
                    </button>
                  </div>
                </div>

                {/* Stats card */}
                <div className={styles.statsCard}>
                  <h2 className={styles.statsTitle}>Mis estadísticas</h2>
                  <div className={styles.statsList}>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{myEvents.length}</span>
                      <span className={styles.statLabel}>Eventos creados</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{savedEvents.length}</span>
                      <span className={styles.statLabel}>Eventos guardados</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Tabs ── */}
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

              {/* ── Event cards ── */}
              {currentEvents.length === 0 ? (
                <div className={styles.empty}>
                  <Calendar size={40} strokeWidth={1.5} />
                  <p>{EMPTY_MESSAGES[activeTab]}</p>
                  {activeTab !== 'pasados' && activeTab !== 'historial' && (
                    <button
                      className={styles.emptyAction}
                      type="button"
                      onClick={() => navigate(activeTab === 'mis-eventos' ? '/crear-evento' : '/dashboard')}
                    >
                      {activeTab === 'mis-eventos' ? 'Crear un evento' : 'Explorar eventos'}
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.grid}>
                  {currentEvents.map(event => (
                    event && (
                      <div key={event.id} className={styles.card}>
                        <div className={styles.cardImageWrap}>
                          <img
                            src={event.imagen_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'}
                            alt={event.titulo}
                            className={styles.cardImage}
                          />
                          {event.categoria && (
                            <span className={styles.cardBadge}>{event.categoria}</span>
                          )}
                          {(activeTab === 'pasados' || activeTab === 'historial') && (
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
                          <div className={styles.cardFooter}>
                            {activeTab === 'mis-eventos' && (
                              <>
                                <button
                                  className={styles.actionBtn}
                                  type="button"
                                  onClick={() => navigate(`/evento/${event.id}/editar`)}
                                >
                                  Gestionar
                                </button>
                                <button
                                  className={styles.deleteBtn}
                                  type="button"
                                  onClick={() => setDeleteTarget(event.id)}
                                  aria-label="Eliminar evento"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                            {activeTab === 'me-interesa' && (
                              <button
                                className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                                type="button"
                                onClick={() => handleQuitarInteres(event.id)}
                              >
                                Quitar
                              </button>
                            )}
                            {(activeTab === 'pasados' || activeTab === 'historial') && (
                              <span className={styles.expiredLabel}>Evento finalizado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </>
          )}
      </div>

      {/* ── Toast de confirmación ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.message}
        </div>
      )}

      {/* ── Edit modal ── */}
      {editOpen && (
        <div className={styles.modalOverlay} onClick={() => setEditOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Editar perfil</h2>

            <div className={styles.modalAvatarWrap}>
              <div className={styles.modalAvatar}>
                {editPreview || avatarUrl ? (
                  <img
                    src={editPreview || avatarUrl}
                    alt="Preview"
                    className={styles.modalAvatarImg}
                  />
                ) : (
                  <span className={styles.modalAvatarInitials}>{initials}</span>
                )}
              </div>
              <button
                className={styles.cameraBtn}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Cambiar foto"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleFotoChange}
              />
            </div>

            <label className={styles.fieldLabel}>Biografía</label>
            <textarea
              className={styles.fieldTextarea}
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              rows={3}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className={styles.saveBtn}
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => !deletingEvent && setDeleteTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Eliminar evento</h2>
            <p className={styles.modalText}>
              ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingEvent}
              >
                Cancelar
              </button>
              <button
                className={styles.deleteConfirmBtn}
                type="button"
                onClick={handleDeleteEvent}
                disabled={deletingEvent}
              >
                {deletingEvent ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
