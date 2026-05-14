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
import Spinner from '../components/ui/Spinner';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}