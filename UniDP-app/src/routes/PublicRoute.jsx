/**
 * @file PublicRoute.jsx
 * @description Ruta pública: redirige a /dashboard si ya hay sesión activa.
 * Muestra un spinner mientras se carga el estado de autenticación.
 *
 * @usage
 * <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Route.module.css';

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.spinnerWrapper}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}