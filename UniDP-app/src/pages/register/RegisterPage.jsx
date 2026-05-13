/**
 * @file RegisterPage.jsx
 * @description Página de registro de nuevos usuarios de UniDP.
 * Valida campos, dominio institucional y crea cuenta en Supabase.
 *
 * @usage
 * // Ruta pública: <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './RegisterPage.module.css';

const UDP_DOMAINS = ['@udp.cl', '@mail.udp.cl'];

function isUdpEmail(email) {
  return UDP_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!nombre || !email || !password || !confirm) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (!isUdpEmail(email)) {
      setError('Solo correos institucionales UDP (@udp.cl o @mail.udp.cl)');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, nombre);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.blobTopRight} aria-hidden="true" />
      <div className={styles.blobBottomLeft} aria-hidden="true" />
      <div className={styles.wave} aria-hidden="true">
        <div className={`${styles.waveCol} ${styles.waveCol1}`} />
        <div className={`${styles.waveCol} ${styles.waveCol2}`} />
        <div className={`${styles.waveCol} ${styles.waveCol3}`} />
      </div>

      <div className={styles.content}>
        {/* Logo section */}
        <div className={styles.logoSection}>
          <div className={styles.logoCard}>
            <span className={`material-symbols-outlined ${styles.logoIcon}`}>school</span>
          </div>
          <h1 className={styles.logoName}>UniDP</h1>
          <p className={styles.logoSubtitle}>Únete a la comunidad UDP</p>
        </div>

        {/* Form card */}
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nombre">Nombre completo</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>person</span>
              <input
                id="nombre"
                type="text"
                className={styles.input}
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Correo institucional</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="correo@udp.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Confirm password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">Confirmar contraseña</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock_reset</span>
              <input
                id="confirm"
                type="password"
                className={styles.input}
                placeholder="Repite tu contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBox} role="alert">
              <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            {!loading && (
              <span className={`material-symbols-outlined ${styles.submitIcon}`}>arrow_forward</span>
            )}
          </button>
        </form>

        <p className={styles.footer}>
          <span className={styles.footerText}>¿Ya tienes cuenta?</span>{' '}
          <Link to="/login" className={styles.footerLink}>Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}