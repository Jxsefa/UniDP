import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getEventById, updateEvent, uploadEventImage } from '../../services/events.service';
import { CATEGORIES } from '../../constants/categories';
import { FACULTIES } from '../../constants/faculties';
import Spinner from '../../components/ui/Spinner';
import Navbar from '../../components/layout/Navbar';
import styles from '../create-event/CreateEventPage.module.css';

export default function EditEventPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Imagen
  const [imagenFile,    setImagenFile]    = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [isDragging,    setIsDragging]    = useState(false);

  // Info básica
  const [titulo,      setTitulo]      = useState('');
  const [categoria,   setCategoria]   = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Fecha y hora de inicio y fin
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin,    setFechaFin]    = useState('');

  // Ubicación
  const [ubicacionTipo,    setUbicacionTipo]    = useState('campus');
  const [facultad,         setFacultad]         = useState('');
  const [detalleUbicacion, setDetalleUbicacion] = useState('');
  const [direccion,        setDireccion]        = useState('');

  // Capacidad
  const [tieneCapacidad, setTieneCapacidad] = useState(false);
  const [capacidad,      setCapacidad]      = useState('');

  // Secciones expandibles
  const [ubicacionExpanded,   setUbicacionExpanded]   = useState(false);
  const [descripcionExpanded, setDescripcionExpanded] = useState(false);

  // UI
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getEventById(id)
      .then(ev => {
        setTitulo(ev.titulo || '');
        setCategoria(ev.categoria || '');
        setDescripcion(ev.descripcion || '');
        setFechaInicio(ev.fecha_in ? new Date(ev.fecha_in).toISOString().slice(0, 16) : '');
        setFechaFin(ev.fecha_fin ? new Date(ev.fecha_fin).toISOString().slice(0, 16) : '');

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

        if (ubStr) setUbicacionExpanded(true);
        if (ev.descripcion) setDescripcionExpanded(true);

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

  function getUbicacionResumen() {
    if (ubicacionTipo === 'campus') {
      if (!facultad) return '';
      return [FACULTIES.find(f => f.id === facultad)?.label, detalleUbicacion.trim()]
        .filter(Boolean).join(' — ');
    }
    return direccion.trim();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim())      return setError('El título es obligatorio.');
    if (titulo.length > 80)  return setError('El título no puede superar los 80 caracteres.');
    if (!categoria)          return setError('Selecciona una categoría.');
    if (!descripcion.trim()) return setError('La descripción es obligatoria.');
    if (descripcion.length > 300) return setError('La descripción no puede superar los 300 caracteres.');
    if (!fechaInicio)        return setError('Indica la fecha y hora de inicio.');
    if (!fechaFin)           return setError('Indica la fecha y hora de fin.');
    if (new Date(fechaFin) <= new Date(fechaInicio))
      return setError('La fecha de fin debe ser posterior a la de inicio.');
    if (ubicacionTipo === 'campus' && !facultad)
      return setError('Selecciona una facultad.');
    if (ubicacionTipo === 'externo' && !direccion.trim())
      return setError('Indica la dirección del evento.');
    if (tieneCapacidad && (!capacidad || parseInt(capacidad) < 1))
      return setError('Ingresa un número de personas válido.');

    const ubicacionFinal = getUbicacionResumen();
    const horas = Math.max(1, Math.round((new Date(fechaFin) - new Date(fechaInicio)) / 3600000));

    setSaving(true);
    try {
      const datos = {
        titulo:      titulo.trim(),
        categoria,
        descripcion: descripcion.trim(),
        ubicacion:   ubicacionFinal,
        duracion:    `${horas} hora${horas > 1 ? 's' : ''}`,
        fecha_in:    new Date(fechaInicio).toISOString(),
        expires_at:  new Date(fechaFin).toISOString(),
        fecha_fin:   new Date(fechaFin).toISOString(),
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

  const categoriaSeleccionada = CATEGORIES.find(c => c.id === categoria);
  const ubicacionResumen = getUbicacionResumen();

  return (
    <div className={styles.page}>

      <Navbar />

      {/* ── Contenido ── */}
      <main className={styles.main}>
        <div className={styles.layout}>

          {/* Columna izquierda: banner */}
          <section className={styles.bannerColumn}>
            <div
              className={`${styles.bannerUpload} ${isDragging ? styles.bannerDragging : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {imagenPreview && (
                <img src={imagenPreview} alt="preview" className={styles.bannerPreview} />
              )}

              {!imagenPreview && (
                <div className={styles.bannerPlaceholder}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                    {isDragging ? 'file_download' : 'add_a_photo'}
                  </span>
                  <p className={styles.bannerText}>
                    {isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o toca para subir'}
                  </p>
                  <p className={styles.bannerHint}>PNG, JPG o WEBP — máx. 5 MB</p>
                </div>
              )}

              <div className={styles.bannerCategoryPill} onClick={e => e.stopPropagation()}>
                <span className="material-symbols-outlined">{categoriaSeleccionada?.icon || 'category'}</span>
                <select
                  className={styles.bannerCategorySelect}
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                >
                  <option value="" disabled>Categoría</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {imagenPreview && (
                <>
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

          {/* Columna derecha: formulario */}
          <form className={styles.formColumn} onSubmit={handleSubmit} noValidate>

            {/* Título */}
            <section className={styles.section}>
              <input
                id="titulo"
                type="text"
                className={styles.titleInput}
                placeholder="Nombre del evento"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                maxLength={80}
              />
              <span className={styles.charCounter}>{titulo.length} / 80</span>
            </section>

            {/* Inicio y Fin */}
            <section className={styles.card}>
              <div className={styles.cardRow}>
                <div className={styles.cardIcon}>
                  <span className="material-symbols-outlined">trip_origin</span>
                </div>
                <div className={styles.cardRowContent}>
                  <p className={styles.cardRowLabel}>Inicio</p>
                  <input
                    id="fechaInicio"
                    type="datetime-local"
                    className={styles.cardInput}
                    value={fechaInicio}
                    min={todayMin}
                    onChange={e => setFechaInicio(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.cardRow}>
                <div className={styles.cardIcon}>
                  <span className="material-symbols-outlined">flag</span>
                </div>
                <div className={styles.cardRowContent}>
                  <p className={styles.cardRowLabel}>Fin</p>
                  <input
                    id="fechaFin"
                    type="datetime-local"
                    className={styles.cardInput}
                    value={fechaFin}
                    min={fechaInicio || todayMin}
                    onChange={e => setFechaFin(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Ubicación */}
            <section className={styles.card}>
              {!ubicacionExpanded ? (
                <button
                  type="button"
                  className={styles.expandableRow}
                  onClick={() => setUbicacionExpanded(true)}
                >
                  <span className="material-symbols-outlined">location_on</span>
                  <div className={styles.expandableText}>
                    <p className={styles.expandableTitle}>
                      {ubicacionResumen || 'Agregar ubicación del evento'}
                    </p>
                    {!ubicacionResumen && (
                      <p className={styles.expandableSubtitle}>Ubicación física o enlace virtual</p>
                    )}
                  </div>
                </button>
              ) : (
                <>
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
                </>
              )}
            </section>

            {/* Descripción */}
            <section className={styles.card}>
              {!descripcionExpanded ? (
                <button
                  type="button"
                  className={styles.expandableRow}
                  onClick={() => setDescripcionExpanded(true)}
                >
                  <span className="material-symbols-outlined">description</span>
                  <div className={styles.expandableText}>
                    <p className={styles.expandableTitle}>
                      {descripcion.trim() || 'Agregar descripción'}
                    </p>
                  </div>
                </button>
              ) : (
                <>
                  <label className={styles.sectionLabel} htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    className={styles.textarea}
                    placeholder="Describe de qué trata tu evento..."
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    maxLength={300}
                    rows={3}
                  />
                  <span className={styles.charCounter}>{descripcion.length} / 300</span>
                </>
              )}
            </section>

            {/* Opciones del evento */}
            <section className={styles.card}>
              <label className={styles.sectionLabel}>Opciones del evento</label>

              <div className={styles.optionRow}>
                <span className="material-symbols-outlined">confirmation_number</span>
                <p className={styles.optionLabel}>Cupo</p>
                {tieneCapacidad ? (
                  <div className={styles.optionValue}>
                    <input
                      type="number"
                      className={styles.capacidadInput}
                      placeholder="—"
                      value={capacidad}
                      min={1}
                      max={9999}
                      onChange={e => setCapacidad(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.optionEditBtn}
                      onClick={() => { setTieneCapacidad(false); setCapacidad(''); }}
                      aria-label="Quitar límite de cupo"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.optionValueBtn}
                    onClick={() => setTieneCapacidad(true)}
                  >
                    Ilimitado
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                )}
              </div>

              <div className={styles.divider} />

              <div className={styles.optionRow}>
                <span className="material-symbols-outlined">account_circle</span>
                <p className={styles.optionLabel}>Publicado como</p>
                <span className={styles.optionValueText}>{user?.email}</span>
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
