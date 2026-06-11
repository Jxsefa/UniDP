import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SIDEBAR_NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../../constants/navigation';
import styles from './AppShell.module.css';

/**
 * Shared shell for the main protected pages: desktop sidebar, mobile bottom nav and FAB.
 * `children` is rendered inside the main content area.
 */
export default function AppShell({ children, activeCategory = null, sidebarItems = SIDEBAR_NAV_ITEMS }) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleNavClick({ path, categoria }) {
    if (categoria) {
      navigate(path, { state: { categoria } });
    } else {
      navigate(path);
    }
  }

  function isNavActive({ path, categoria }) {
    if (location.pathname !== path) return false;
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
            <item.Icon size={22} />
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
