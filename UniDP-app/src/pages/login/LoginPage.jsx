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
  const { login, loginWithGoogle, authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
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

          {/* Error email/password */}
          {(error || authError) && (
            <div className={styles.errorBox} role="alert">
              <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
              {error || authError}
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

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>o</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Google */}
          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirigiendo...' : 'Continuar con Google UDP'}
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