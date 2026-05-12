/**
 * @file Navbar.jsx
 * @description Barra de navegación superior para páginas protegidas.
 * Muestra el logo UniDP, el correo del usuario y el botón de cierre de sesión.
 *
 * @usage
 * // Renderizada automáticamente por ProtectedRoute sobre el contenido.
 * import Navbar from './components/layout/Navbar';
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={`material-symbols-outlined ${styles.brandIcon}`}>school</span>
          <span className={styles.brandName}>UniDP</span>
        </div>

        <div className={styles.right}>
          {user && (
            <span className={styles.userEmail}>{user.email}</span>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout} type="button">
            <span className={`material-symbols-outlined ${styles.logoutIcon}`}>logout</span>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}