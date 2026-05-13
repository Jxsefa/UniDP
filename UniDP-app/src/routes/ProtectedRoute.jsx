/**
 * @file ProtectedRoute.jsx
 * @description Ruta protegida: redirige a /login si no hay sesión activa.
 * Muestra un spinner mientras se carga el estado de autenticación.
 * Renderiza Navbar sobre el contenido protegido.
 *
 * @usage
 * <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}