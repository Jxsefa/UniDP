import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SIDEBAR_NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getUnreadCount } from '../../services/notificaciones.service';
import styles from './AppShell.module.css';

const POLL_INTERVAL_MS = 45000;

/**
 * Shared shell for the main protected pages: desktop sidebar, mobile bottom nav and FAB.
 * `children` is rendered inside the main content area.
 */
export default function AppShell({ children, activeCategory = null, sidebarItems = SIDEBAR_NAV_ITEMS }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getUnreadCount(user.id).then(setUnreadCount).catch(console.error);
    const timer = setInterval(() => {
      getUnreadCount(user.id).then(setUnreadCount).catch(console.error);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [user]);

  function handleNavClick({ path, categoria }) {
    if (!path) return;
    if (categoria) {
      navigate(path, { state: { categoria } });
    } else {
      navigate(path);
    }
  }

  function isNavActive({ path, categoria }) {
    if (!path || location.pathname !== path) return false;
    if (path === '/dashboard') return (categoria ?? null) === activeCategory;
    return true;
  }

  return (
    <div className={styles.layout}>

      {/* ── Sidebar — desktop only ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>UniDP Hub</span>
          <span className={styles.sidebarSub}>Universidad Diego Portales</span>
        </div>

        <nav className={styles.sidebarNav}>
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`${styles.navItem} ${isNavActive(item) ? styles.navItemActive : ''}`}
              onClick={() => handleNavClick(item)}
              type="button"
            >
              <item.Icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.createBtnFull}
            onClick={() => navigate('/crear-evento')}
            type="button"
          >
            <Plus size={18} />
            Crear Evento
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        {children}
      </main>

      {/* ── Bottom navigation — mobile only ── */}
      <nav className={styles.bottomNav}>
        {BOTTOM_NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`${styles.bottomNavItem} ${isNavActive(item) ? styles.bottomNavActive : ''}`}
            onClick={() => handleNavClick(item)}
            type="button"
          >
            <span className={styles.bottomNavIconWrap}>
              <item.Icon size={22} />
              {item.showUnreadBadge && unreadCount > 0 && (
                <span className={styles.bottomNavBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── FAB — mobile only ── */}
      <button
        className={styles.fab}
        onClick={() => navigate('/crear-evento')}
        aria-label="Crear evento"
        type="button"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
