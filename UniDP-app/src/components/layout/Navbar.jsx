import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = getInitials(user);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <span className={styles.brandName}>UniDP</span>

        <div className={styles.right}>
          <button className={styles.iconBtn} aria-label="Notificaciones">
            <Bell size={20} />
          </button>

          <div className={styles.avatarWrap} ref={menuRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menú de usuario"
              type="button"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInitials}>{initials}</span>
              )}
            </button>

            {menuOpen && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => { setMenuOpen(false); navigate('/perfil'); }}
                  type="button"
                >
                  Mi perfil
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                  type="button"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
