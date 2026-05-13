/**
 * @file Login.jsx
 * @description Página de inicio de sesión de UniDP.
 * Valida dominio institucional (@udp.cl / @mail.udp.cl) y autentica con Supabase.
 *
 * @usage
 * // Ruta pública: <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginPage.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Background decorations */}
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
          <p className={styles.logoSubtitle}>Accede a tu vida universitaria</p>
        </div>

        {/* Form card */}
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Correo Institucional</label>
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
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
            </div>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            {!loading && (
              <span className={`material-symbols-outlined ${styles.submitIcon}`}>arrow_forward</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className={styles.footer}>
          <span className={styles.footerText}>¿No tienes cuenta?</span>{' '}
          <Link to="/register" className={styles.footerLink}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}