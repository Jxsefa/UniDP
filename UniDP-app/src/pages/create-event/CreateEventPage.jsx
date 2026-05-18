/**
 * @file CreateEventPage.jsx
 * @description Página para crear eventos con diseño tipo Luma.
 * Ruta protegida: /crear-evento
 * Requiere usuario autenticado via AuthContext.
 *
 * @usage
 * <Route path="/crear-evento" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createEvent, uploadEventImage } from '../../services/events.service';
import { CATEGORIES, DURATIONS } from '../../constants/categories';
import styles from './CreateEventPage.module.css';

export default function CreateEventPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const fileInputRef = useRef(null);

  // Estado del formulario
  const [titulo,      setTitulo]      = useState('');
  const [categoria,   setCategoria]   = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion,   setUbicacion]   = useState('');
  const [duracion,    setDuracion]    = useState('');
  const [esPublico,   setEsPublico]   = useState(true);
  const [imagenFile,  setImagenFile]  = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [isDragging,  setIsDragging]  = useState(false);

  // Estado UI
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

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

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!titulo.trim())      return setError('El título es obligatorio');
    if (!categoria)          return setError('Selecciona una categoría');
    if (!descripcion.trim()) return setError('La descripción es obligatoria');
    if (!ubicacion.trim())   return setError('La ubicación es obligatoria');
    if (!duracion)           return setError('Selecciona una duración');

    setLoading(true);
    try {
      let imagenUrl = null;
      if (imagenFile) imagenUrl = await uploadEventImage(imagenFile);

      await createEvent({
        titulo, categoria, descripcion, ubicacion, duracion,
        fechaInicio: new Date().toISOString(),
        esPublico,
        autorId: user.id,
        imagenUrl,
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Error al publicar el evento. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className={styles.page}>

        {/* ── Navbar ── */}
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <button
                className={styles.closeBtn}
                onClick={() => navigate(-1)}
                aria-label="Volver"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <span className={styles.navTitle}>UniDP</span>
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

        {/* ── Contenido principal ── */}
        <main className={styles.main}>
          <div className={styles.container}>

            {/* Header */}
            <header className={styles.header}>
              <h2 className={styles.heading}>Crear Nuevo Evento</h2>
              <p className={styles.subheading}>
                Completa los detalles para lanzar tu evento en el campus.
              </p>
            </header>

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
                    <button
                      type="button"
                      className={styles.bannerRemove}
                      onClick={e => { e.stopPropagation(); setImagenFile(null); setImagenPreview(null); }}
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
                    <p className={styles.bannerHint}>PNG, JPG o WEBP — máx. 5MB</p>
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
                <label className={styles.sectionLabel} htmlFor="titulo">
                  Título del Evento
                </label>
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
                        style={categoria === cat.id
                            ? { fontVariationSettings: "'FILL' 1" }
                            : {}}
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
                <label className={styles.sectionLabel} htmlFor="descripcion">
                  Descripción
                </label>
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
                <div className={styles.row}>
                  <div className={styles.halfField}>
                    <label className={styles.sectionLabel} htmlFor="fecha">Fecha</label>
                    <div className={styles.inputIcon}>
                      <span className="material-symbols-outlined">calendar_today</span>
                      <input
                          id="fecha"
                          type="date"
                          className={styles.inputWithIcon}
                      />
                    </div>
                  </div>
                  <div className={styles.halfField}>
                    <label className={styles.sectionLabel} htmlFor="hora">Hora</label>
                    <div className={styles.inputIcon}>
                      <span className="material-symbols-outlined">schedule</span>
                      <input
                          id="hora"
                          type="time"
                          className={styles.inputWithIcon}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Ubicación */}
              <section className={styles.section}>
                <label className={styles.sectionLabel} htmlFor="ubicacion">Ubicación</label>
                <div className={styles.inputIcon}>
                  <span className="material-symbols-outlined">location_on</span>
                  <input
                      id="ubicacion"
                      type="text"
                      className={styles.inputWithIcon}
                      placeholder="Busca edificios del campus..."
                      value={ubicacion}
                      onChange={e => setUbicacion(e.target.value)}
                  />
                </div>
              </section>

              {/* Duración */}
              <section className={styles.section}>
                <label className={styles.sectionLabel}>Duración del Evento</label>
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

              {/* Configuración */}
              <section className={styles.section}>
                <label className={styles.sectionLabel}>Configuración</label>
                <div className={styles.settingsCard}>

                  {/* Público */}
                  <div className={styles.settingRow}>
                    <div className={styles.settingIcon}>
                      <span className="material-symbols-outlined">public</span>
                    </div>
                    <div className={styles.settingInfo}>
                      <p className={styles.settingTitle}>Evento Público</p>
                      <p className={styles.settingDesc}>Visible para todos los estudiantes</p>
                    </div>
                    <button
                        type="button"
                        className={`${styles.toggle} ${esPublico ? styles.toggleOn : styles.toggleOff}`}
                        onClick={() => setEsPublico(!esPublico)}
                        aria-label="Toggle público"
                    >
                      <div className={`${styles.toggleThumb} ${esPublico ? styles.thumbOn : styles.thumbOff}`} />
                    </button>
                  </div>

                  <div className={styles.divider} />

                  {/* Publicado por */}
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

              {/* Error */}
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
            <span>{loading ? 'Publicando...' : 'Publicar Evento'}</span>
            <span className="material-symbols-outlined">send</span>
          </button>
          <p className={styles.footerNote}>
            Al publicar, aceptas las Pautas del Campus UniDP.
          </p>
        </footer>

      </div>
  );
}