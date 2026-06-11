import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Calendar, GraduationCap, Users, Users2, Trophy,
  Camera, Edit, Plus, MapPin,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateProfile } from '../../services/auth.service';
import {
  getEventosByAutor,
  getEventosMeInteresa,
  getEventosPasados,
  toggleInteres,
} from '../../services/events.service';
import Spinner from '../../components/ui/Spinner';
import styles from './ProfilePage.module.css';

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

const TABS = [
  { id: 'mis-eventos', label: 'Mis eventos' },
  { id: 'me-interesa', label: 'Me interesa' },
  { id: 'pasados',     label: 'Eventos pasados' },
];

const EMPTY_MESSAGES = {
  'mis-eventos': 'No has creado ningún evento aún.',
  'me-interesa': 'No tienes eventos guardados. ¡Explora el feed!',
  'pasados':     'No tienes eventos pasados.',
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
  const location    = useLocation();
  const fileInputRef = useRef(null);

  const [profile, setProfile]         = useState(null);
  const [activeTab, setActiveTab]     = useState('mis-eventos');
  const [myEvents, setMyEvents]       = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [pastEvents, setPastEvents]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editOpen, setEditOpen]       = useState(false);

  const [editBio, setEditBio]         = useState('');
  const [editFoto, setEditFoto]       = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null);

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
    ])
      .then(([prof, myEvs, saved, past]) => {
        setProfile(prof);
        setMyEvents(myEvs ?? []);
        setSavedEvents((saved ?? []).filter(Boolean));
        setPastEvents(past ?? []);
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

  async function handleQuitarInteres(eventoId) {
    if (!user) return;
    try {
      await toggleInteres(user.id, eventoId);
      setSavedEvents(prev => prev.filter(ev => ev?.id !== eventoId));
    } catch (err) {
      console.error(err);
    }
  }

  function handleNavClick({ path, categoria }) {
    if (categoria) {
      navigate(path, { state: { categoria } });
    } else {
      navigate(path);
    }
  }

  function isNavActive({ path, categoria }) {
    if (location.pathname !== path) return false;
    if (categoria) return false;
    return true;
  }

  const displayName = profile?.nombre || user?.user_metadata?.full_name || user?.email || '';
  const avatarUrl   = profile?.foto_url || user?.user_metadata?.avatar_url;
  const initials    = getInitials(user, profile);

  const tabEvents = {
    'mis-eventos': myEvents,
    'me-interesa': savedEvents,
    'pasados':     pastEvents,
  };
  const currentEvents = tabEvents[activeTab] || [];

  /* ── Render ────────────────────────────────────────────── */
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

      {/* ── Main ── */}
      <main className={styles.main}>
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
                  {activeTab !== 'pasados' && (
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
                          <div className={styles.cardFooter}>
                            {activeTab === 'mis-eventos' && (
                              <button
                                className={styles.actionBtn}
                                type="button"
                                onClick={() => navigate(`/evento/${event.id}/editar`)}
                              >
                                Gestionar
                              </button>
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
                            {activeTab === 'pasados' && (
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
      </main>

      {/* ── Bottom nav — mobile only ── */}
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
    </div>
  );
}
