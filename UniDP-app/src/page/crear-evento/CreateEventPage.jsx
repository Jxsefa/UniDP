/**
 * @file CreateEventPage.jsx
 * @description Página para crear y publicar eventos universitarios en UniDP.
 * Inserta el evento en la tabla 'events' de Supabase con expiración calculada por duración.
 *
 * @usage
 * // Ruta protegida: <Route path="/crear-evento" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import styles from './CreateEventPage.module.css';

export default function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const horas = parseInt(duracion);
      const expiresAt = new Date(Date.now() + horas * 3600 * 1000).toISOString();

      const { error: insertError } = await supabase.from('events').insert({
        titulo,
        categoria,
        descripcion,
        ubicacion,
        duracion,
        autor_id:    user.id,
        autor_email: user.email,
        creado_en:   new Date().toISOString(),
        expires_at:  expiresAt,
        estado:      'activo',
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTitulo('');
      setCategoria('');
      setDescripcion('');
      setUbicacion('');
      setDuracion('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* Header */}
        <button className={styles.backBtn} onClick={() => navigate(-1)} type="button">
          ← Volver
        </button>
        <h1 className={styles.title}>Crear Evento</h1>
        <p className={styles.subtitle}>Comparte una actividad con tu comunidad UDP</p>

        {/* Form card */}
        <form className={styles.card} onSubmit={handleSubmit} noValidate>

          {/* Título */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="titulo">Título del evento</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>edit</span>
              <input
                id="titulo"
                type="text"
                className={styles.input}
                placeholder="Nombre del evento"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={80}
                required
              />
            </div>
            <span className={styles.counter}>{titulo.length} / 80</span>
          </div>

          {/* Categoría */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="categoria">Categoría</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>category</span>
              <select
                id="categoria"
                className={`${styles.input} ${styles.select}`}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                <option value="">-- Selecciona una categoría --</option>
                <option value="Academia">Academia</option>
                <option value="Social">Social</option>
                <option value="Bienestar">Bienestar</option>
                <option value="Tech">Tech</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <span className={`material-symbols-outlined ${styles.labelIcon}`}>description</span>
              <label className={styles.label} htmlFor="descripcion">Descripción</label>
            </div>
            <textarea
              id="descripcion"
              className={`${styles.input} ${styles.textarea}`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              maxLength={300}
              required
              placeholder="Describe brevemente el evento..."
            />
            <span className={styles.counter}>{descripcion.length} / 300</span>
          </div>

          {/* Ubicación */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ubicacion">Ubicación</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>location_on</span>
              <input
                id="ubicacion"
                type="text"
                className={styles.input}
                placeholder="Ej: Biblioteca piso 2, Sala B-301"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duración */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="duracion">Duración</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>schedule</span>
              <select
                id="duracion"
                className={`${styles.input} ${styles.select}`}
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                required
              >
                <option value="">-- Selecciona duración --</option>
                <option value="1">1 hora</option>
                <option value="2">2 horas</option>
                <option value="4">4 horas</option>
              </select>
            </div>
          </div>

          {/* Autor info */}
          <div className={styles.infoRow}>
            <span className={styles.infoText}>
              Publicado como: <strong>{user?.email}</strong>
            </span>
          </div>

          {/* Success */}
          {success && (
            <div className={styles.successBox} role="status">
              <span className={`material-symbols-outlined ${styles.successIcon}`}>check_circle</span>
              ¡Evento publicado exitosamente!
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={styles.errorBox} role="alert">
              <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Publicando...' : 'Publicar Evento'}
              {!loading && (
                <span className={`material-symbols-outlined ${styles.submitIcon}`}>check_circle</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}