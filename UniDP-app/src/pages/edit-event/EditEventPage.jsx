import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getEventById, updateEvent, uploadEventImage } from '../../services/events.service';
import { CATEGORIES, DURATIONS } from '../../constants/categories';
import { FACULTIES } from '../../constants/faculties';
import Spinner from '../../components/ui/Spinner';
import styles from '../create-event/CreateEventPage.module.css';

export default function EditEventPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [imagenFile,    setImagenFile]    = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [isDragging,    setIsDragging]    = useState(false);

  const [titulo,      setTitulo]      = useState('');
  const [categoria,   setCategoria]   = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaHora,   setFechaHora]   = useState('');
  const [duracion,    setDuracion]    = useState('');

  const [ubicacionTipo,    setUbicacionTipo]    = useState('externo');
  const [facultad,         setFacultad]         = useState('');
  const [detalleUbicacion, setDetalleUbicacion] = useState('');
  const [direccion,        setDireccion]        = useState('');

  const [tieneCapacidad, setTieneCapacidad] = useState(false);
  const [capacidad,      setCapacidad]      = useState('');

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getEventById(id)
      .then(ev => {
        setTitulo(ev.titulo || '');
        setCategoria(ev.categoria || '');
        setDescripcion(ev.descripcion || '');
        setFechaHora(ev.fecha_in ? new Date(ev.fecha_in).toISOString().slice(0, 16) : '');

        const horas = parseInt(ev.duracion);
        if (horas) setDuracion(String(horas));

        const ubStr = ev.ubicacion || '';
        const matchedFaculty = FACULTIES.find(f => ubStr.startsWith(f.label));
        if (matchedFaculty) {
          setUbicacionTipo('campus');
          setFacultad(matchedFaculty.id);
          setDetalleUbicacion(
            ubStr.replace(`${matchedFaculty.label} — `, '').replace(matchedFaculty.label, '').trim()
          );
        } else {
          setUbicacionTipo('externo');
          setDireccion(ubStr);
        }

        if (ev.capacidad) {
          setTieneCapacidad(true);
          setCapacidad(String(ev.capacidad));
        }
        if (ev.imagen_url) setImagenPreview(ev.imagen_url);
      })
      .catch(() => setError('No se pudo cargar el evento.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setImagenFile(file);
    setImagenPreview(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim())      return setError('El título es obligatorio.');
    if (!categoria)          return setError('Selecciona una categoría.');
    if (!descripcion.trim()) return setError('La descripción es obligatoria.');
    if (!fechaHora)          return setError('Indica la fecha y hora del evento.');
    if (!duracion)           return setError('Selecciona la duración del evento.');
    if (ubicacionTipo === 'campus' && !facultad)
      return setError('Selecciona una facultad.');
    if (ubicacionTipo === 'externo' && !direccion.trim())
      return setError('Indica la dirección del evento.');
    if (tieneCapacidad && (!capacidad || parseInt(capacidad) < 1))
      return setError('Ingresa un número de personas válido.');

    const ubicacionFinal = ubicacionTipo === 'campus'
      ? [FACULTIES.find(f => f.id === facultad)?.label, detalleUbicacion.trim()]
          .filter(Boolean).join(' — ')
      : direccion.trim();

    const horas    = parseInt(duracion);
    const fechaFin = new Date(new Date(fechaHora).getTime() + horas * 3600 * 1000).toISOString();

    setSaving(true);
    try {
      const datos = {
        titulo:      titulo.trim(),
        categoria,
        descripcion: descripcion.trim(),
        ubicacion:   ubicacionFinal,
        duracion:    `${horas} hora${horas > 1 ? 's' : ''}`,
        fecha_in:    new Date(fechaHora).toISOString(),
        expires_at:  fechaFin,
        fecha_fin:   fechaFin,
        capacidad:   tieneCapacidad ? parseInt(capacidad) : null,
      };

      if (imagenFile) {
        datos.imagen_url = await uploadEventImage(imagenFile);
      }

      await updateEvent(id, datos);
      navigate('/perfil');
    } catch {
      setError('Error al guardar los cambios. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  }

  const todayMin = new Date().toISOString().slice(0, 16);

  if (loading) return <Spinner />;

  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button
            className={styles.closeBtn}
            onClick={() => navigate('/perfil')}
            aria-label="Volver al perfil"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className={styles.navTitle}>Editar evento</span>
        </div>
        <div className={styles.navRight}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            notifications
          </span>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_circle
          </span>
        </div>
      </nav>

      {/* ── Contenido ── */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Banner */}
          <section className={styles.bannerSection}>
            <label className={styles.sectionLabel}>Banner del Evento</label>
            <div
              className={`${styles.bannerUpload} ${isDragging ? styles.bannerDragging : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {imagenPreview ? (
                <>
                  <img src={imagenPreview} alt="preview" className={styles.bannerPreview} />
                  <div className={styles.bannerOverlayChange}>
                    <span className="material-symbols-outlined">photo_camera</span>
                    Cambiar foto
                  </div>
                  <button
                    type="button"
                    className={styles.bannerRemove}
                    onClick={e => {
                      e.stopPropagation();
                      setImagenFile(null);
                      setImagenPreview(null);
                    }}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <div className={styles.bannerOverlay}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                    {isDragging ? 'file_download' : 'add_a_photo'}
                  </span>
                  <p className={styles.bannerText}>
                    {isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o toca para subir'}
                  </p>
                  <p className={styles.bannerHint}>PNG, JPG o WEBP — máx. 5 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </section>

          <form onSubmit={handleSubmit} noValidate>

            {/* Título */}
            <section className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="titulo">Título del Evento</label>
              <input
                id="titulo"
                type="text"
                className={styles.input}
                placeholder="Ej. Torneo de Fútbol Inter-Facultades"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                maxLength={80}
              />
              <span className={styles.charCounter}>{titulo.length} / 80</span>
            </section>

            {/* Categoría */}
            <section className={styles.section}>
              <label className={styles.sectionLabel}>Categoría</label>
              <div className={styles.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.categoryBtn} ${categoria === cat.id ? styles.categoryActive : ''}`}
                    onClick={() => setCategoria(cat.id)}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={categoria === cat.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Descripción */}
            <section className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                className={styles.textarea}
                placeholder="Describe de qué trata tu evento..."
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                maxLength={300}
                rows={4}
              />
              <span className={styles.charCounter}>{descripcion.length} / 300</span>
            </section>

            {/* Fecha y Hora */}
            <section className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="fechaHora">Fecha y Hora</label>
              <div className={styles.inputIcon}>
                <span className="material-symbols-outlined">event</span>
                <input
                  id="fechaHora"
                  type="datetime-local"
                  className={styles.inputWithIcon}
                  value={fechaHora}
                  min={todayMin}
                  onChange={e => setFechaHora(e.target.value)}
                />
              </div>
            </section>

            {/* Duración */}
            <section className={styles.section}>
              <label className={styles.sectionLabel}>Duración</label>
              <div className={styles.durationRow}>
                {DURATIONS.map(dur => (
                  <button
                    key={dur.id}
                    type="button"
                    className={`${styles.durationBtn} ${duracion === dur.id ? styles.durationActive : ''}`}
                    onClick={() => setDuracion(dur.id)}
                  >
                    <span className="material-symbols-outlined">timer</span>
                    {dur.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Ubicación */}
            <section className={styles.section}>
              <label className={styles.sectionLabel}>Ubicación</label>
              <div className={styles.locationToggle}>
                <button
                  type="button"
                  className={`${styles.locationTypeBtn} ${ubicacionTipo === 'campus' ? styles.locationTypeActive : ''}`}
                  onClick={() => setUbicacionTipo('campus')}
                >
                  <span className="material-symbols-outlined">school</span>
                  Campus UDP
                </button>
                <button
                  type="button"
                  className={`${styles.locationTypeBtn} ${ubicacionTipo === 'externo' ? styles.locationTypeActive : ''}`}
                  onClick={() => setUbicacionTipo('externo')}
                >
                  <span className="material-symbols-outlined">location_city</span>
                  Fuera del campus
                </button>
              </div>

              {ubicacionTipo === 'campus' ? (
                <>
                  <select
                    className={`${styles.input} ${!facultad ? styles.selectEmpty : ''}`}
                    value={facultad}
                    onChange={e => setFacultad(e.target.value)}
                  >
                    <option value="">Selecciona una facultad...</option>
                    {FACULTIES.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Sala, piso u otro detalle (opcional)"
                    value={detalleUbicacion}
                    onChange={e => setDetalleUbicacion(e.target.value)}
                    maxLength={80}
                  />
                </>
              ) : (
                <div className={styles.inputIcon}>
                  <span className="material-symbols-outlined">location_on</span>
                  <input
                    type="text"
                    className={styles.inputWithIcon}
                    placeholder="Dirección completa del evento"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    maxLength={120}
                  />
                </div>
              )}
            </section>

            {/* Capacidad */}
            <section className={styles.section}>
              <label className={styles.sectionLabel}>Configuración</label>
              <div className={styles.settingsCard}>

                <div className={styles.settingRow}>
                  <div className={styles.settingIcon}>
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <div className={styles.settingInfo}>
                    <p className={styles.settingTitle}>Límite de personas</p>
                    <p className={styles.settingDesc}>
                      {tieneCapacidad ? 'Con límite de asistentes' : 'Sin límite de asistentes'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`${styles.toggle} ${tieneCapacidad ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => { setTieneCapacidad(v => !v); setCapacidad(''); }}
                    aria-label="Toggle capacidad"
                  >
                    <div className={styles.toggleThumb} />
                  </button>
                </div>

                {tieneCapacidad && (
                  <>
                    <div className={styles.divider} />
                    <div className={styles.settingRow}>
                      <div className={styles.settingIcon}>
                        <span className="material-symbols-outlined">person_add</span>
                      </div>
                      <div className={styles.settingInfo}>
                        <p className={styles.settingTitle}>Número máximo</p>
                        <p className={styles.settingDesc}>Personas permitidas</p>
                      </div>
                      <input
                        type="number"
                        className={styles.capacidadInput}
                        placeholder="—"
                        value={capacidad}
                        min={1}
                        max={9999}
                        onChange={e => setCapacidad(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className={styles.divider} />

                <div className={styles.settingRow}>
                  <div className={styles.settingIcon}>
                    <span className="material-symbols-outlined">account_circle</span>
                  </div>
                  <div className={styles.settingInfo}>
                    <p className={styles.settingTitle}>Publicado como</p>
                    <p className={styles.settingDesc}>{user?.email}</p>
                  </div>
                </div>

              </div>
            </section>

            {error && (
              <div className={styles.errorBox}>
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

          </form>
        </div>
      </main>

      {/* ── Footer fijo ── */}
      <footer className={styles.footer}>
        <button
          type="submit"
          className={styles.publishBtn}
          onClick={handleSubmit}
          disabled={saving}
        >
          <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
          <span className="material-symbols-outlined">save</span>
        </button>
        <p className={styles.footerNote}>Los cambios serán visibles de inmediato.</p>
      </footer>

    </div>
  );
}
