/**
 * @file ProtectedRoute.jsx
 * @description Ruta protegida: redirige a /login si no hay sesión activa.
 * Muestra un spinner mientras se carga el estado de autenticación.
 * Renderiza Navbar sobre el contenido protegido.
 * Con `requireAdmin`, además redirige a /dashboard si el perfil no tiene role 'admin'.
 *
 * @usage
 * <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 * <Route path="/admin/reportes" element={<ProtectedRoute requireAdmin><AdminReportsPage /></ProtectedRoute>} />
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';

export default function ProtectedRoute({ children, showNav = true, requireAdmin = false }) {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    if (profileLoading) return <Spinner />;
    if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      {showNav && <Navbar />}
      {children}
    </>
  );
}