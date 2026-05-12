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
import styles from './Route.module.css';

const Login = lazy(() => import('../page/login/Login'));
const RegisterPage = lazy(() => import('../page/register/RegisterPage'));
const CreateEventPage = lazy(() => import('../page/crear-evento/CreateEventPage'));

function PageSpinner() {
  return (
    <div className={styles.spinnerWrapper}>
      <div className={styles.spinner} />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                      <h1 style={{ color: '#291714' }}>Dashboard — próximamente</h1>
                      <button
                          onClick={() => window.location.href = '/crear-evento'}
                          style={{
                              marginTop: '24px',
                              background: '#b70006',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '12px 24px',
                              fontSize: '16px',
                              fontWeight: '700',
                              cursor: 'pointer',
                          }}
                      >
                          + Crear Evento
                      </button>
                  </div>
              </div>
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}