/**
 * @file AppRouter.jsx
 * @description Configuración central de rutas de la aplicación UniDP.
 * Separa rutas públicas (login, registro) de rutas protegidas (dashboard, crear-evento).
 *
 * @usage
 * import AppRouter from './routes/AppRouter';
 * // Renderizar dentro de BrowserRouter y AuthProvider
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import Spinner from '../components/ui/Spinner';

const LoginPage = lazy(() => import('../pages/login/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const CreateEventPage = lazy(() => import('../pages/create-event/CreateEventPage'));
const CalendarPage  = lazy(() => import('../pages/calendar/CalendarPage'));
const ProfilePage   = lazy(() => import('../pages/profile/ProfilePage'));
const EditEventPage = lazy(() => import('../pages/edit-event/EditEventPage'));
const UserProfilePage = lazy(() => import('../pages/user-profile/UserProfilePage'));
const AdminReportsPage = lazy(() => import('../pages/admin-reports/AdminReportsPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));
const DesignPreviewPage = import.meta.env.DEV
  ? lazy(() => import('../pages/design-preview/DesignPreviewPage'))
  : null;

export default function AppRouter() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crear-evento"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendario"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuario/:id"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/evento/:id/editar"
          element={
            <ProtectedRoute>
              <EditEventPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notificaciones"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reportes"
          element={
            <ProtectedRoute requireAdmin>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />

        {import.meta.env.DEV && (
          <Route path="/design-preview" element={<DesignPreviewPage />} />
        )}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}