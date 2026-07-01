import { useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, ShieldAlert, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import NotificationBell from './NotificationBell';
import styles from './Navbar.module.css';

function getInitials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '';
  const parts = name.split(/[\s@]/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const avatarUrl = profile?.foto_url || user?.user_metadata?.avatar_url;
  const initials  = getInitials(user);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <button
          className={styles.brandName}
          onClick={() => navigate('/dashboard')}
          aria-label="Ir al inicio"
          type="button"
        >
          <GraduationCap size={30} />
          UniDP
        </button>

        <div className={styles.right}>
          <button
            className={styles.iconBtn}
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {profile?.role === 'admin' && (
            <button
              className={styles.iconBtn}
              aria-label="Panel de denuncias"
              onClick={() => navigate('/admin/reportes')}
              type="button"
            >
              <ShieldAlert size={20} />
            </button>
          )}

          <NotificationBell />

          <button
            className={styles.iconBtn}
            aria-label="Cerrar sesión"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={20} />
          </button>

          <button
            className={styles.avatarBtn}
            onClick={() => navigate('/perfil')}
            aria-label="Mi perfil"
            type="button"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
