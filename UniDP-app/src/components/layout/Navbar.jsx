import { useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
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
        <span className={styles.brandName}>UniDP</span>

        <div className={styles.right}>
          <button className={styles.iconBtn} aria-label="Notificaciones" type="button">
            <Bell size={20} />
          </button>

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
