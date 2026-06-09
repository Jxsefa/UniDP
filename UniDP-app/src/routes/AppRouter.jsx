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
            <ProtectedRoute showNav={false}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}