import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createEvent, uploadEventImage } from '../../services/events.service';
import { CATEGORIES } from '../../constants/categories';
import { FACULTIES } from '../../constants/faculties';
import DateTimePicker from '../../components/ui/DateTimePicker';
import Navbar from '../../components/layout/Navbar';
import styles from './CreateEventPage.module.css';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const avatarUrl = profile?.foto_url || user?.user_metadata?.avatar_url;
  const initials  = (() => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    const parts = name.split(/[\s@]/);
    if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  })();
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

  // Selector de categoría
  const [categoriaMenuOpen, setCategoriaMenuOpen] = useState(false);
  const categoriaMenuRef = useRef(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!categoriaMenuOpen) return;
    function handleClickOutside(e) {
      if (categoriaMenuRef.current && !categoriaMenuRef.current.contains(e.target)) {
        setCategoriaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoriaMenuOpen]);

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
    if (new Date(fechaInicio) < new Date())
      return setError('La fecha de inicio no puede ser en el pasado.');
    if (new Date(fechaFin) <= new Date(fechaInicio))
      return setError('La fecha de fin debe ser posterior a la de inicio.');
    if (ubicacionTipo === 'campus' && !facultad)
      return setError('Selecciona una facultad.');
    if (ubicacionTipo === 'externo' && !direccion.trim())
      return setError('Indica la dirección del evento.');
    if (tieneCapacidad && (!capacidad || parseInt(capacidad) < 1))
      return setError('Ingresa un número de personas válido.');

    const ubicacionFinal = getUbicacionResumen();

    setLoading(true);
    try {
      let imagenUrl = null;
      if (imagenFile) imagenUrl = await uploadEventImage(imagenFile);

      await createEvent({
        titulo, categoria, descripcion,
        ubicacion:   ubicacionFinal,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin:    new Date(fechaFin).toISOString(),
        capacidad:   tieneCapacidad ? parseInt(capacidad) : null,
        autorId:     user.id,
        imagenUrl,
      });

      navigate('/dashboard');
    } catch {
      setError('Error al publicar el evento. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  const now = new Date();
  const todayMin = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

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

            {/* Categoría */}
            <section className={styles.section}>
              <label className={styles.sectionLabel}>Categoría</label>
              <div className={styles.categoryDropdown} ref={categoriaMenuRef}>
                <button
                  type="button"
                  className={`${styles.categoryTrigger} ${!categoria ? styles.selectEmpty : ''}`}
                  onClick={() => setCategoriaMenuOpen(open => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={categoriaMenuOpen}
                >
                  <span className={styles.categoryTriggerIcon}>
                    <span className="material-symbols-outlined">{categoriaSeleccionada?.icon || 'category'}</span>
                  </span>
                  <span className={styles.categoryTriggerLabel}>
                    {categoriaSeleccionada?.label || 'Selecciona una categoría...'}
                  </span>
                  <span className={`material-symbols-outlined ${styles.categoryTriggerChevron} ${categoriaMenuOpen ? styles.categoryTriggerChevronOpen : ''}`}>
                    expand_more
                  </span>
                </button>

                {categoriaMenuOpen && (
                  <ul className={styles.categoryMenu} role="listbox">
                    {CATEGORIES.map(cat => (
                      <li key={cat.id} role="option" aria-selected={categoria === cat.id}>
                        <button
                          type="button"
                          className={`${styles.categoryOption} ${categoria === cat.id ? styles.categoryOptionActive : ''}`}
                          onClick={() => { setCategoria(cat.id); setCategoriaMenuOpen(false); }}
                        >
                          <span className={styles.categoryOptionIcon}>
                            <span className="material-symbols-outlined">{cat.icon}</span>
                          </span>
                          <span>{cat.label}</span>
                          {categoria === cat.id && (
                            <span className={`material-symbols-outlined ${styles.categoryOptionCheck}`}>check</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Inicio y Fin */}
            <section className={styles.card}>
              <div className={styles.cardRow}>
                <div className={styles.cardIcon}>
                  <span className="material-symbols-outlined">trip_origin</span>
                </div>
                <div className={styles.cardRowContent}>
                  <p className={styles.cardRowLabel}>Inicio</p>
                  <DateTimePicker
                    id="fechaInicio"
                    value={fechaInicio}
                    min={todayMin}
                    onChange={setFechaInicio}
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
                  <DateTimePicker
                    id="fechaFin"
                    value={fechaFin}
                    min={fechaInicio || todayMin}
                    onChange={setFechaFin}
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
                    autoFocus
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
                      autoFocus
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
          disabled={loading}
        >
          <span>{loading ? 'Publicando...' : 'Crear evento'}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <p className={styles.footerNote}>Al publicar, aceptas las Pautas del Campus UniDP.</p>
      </footer>

    </div>
  );
}
