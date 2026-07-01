import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PROPOSALS } from './proposals';
import styles from './DesignPreviewPage.module.css';

export default function DesignPreviewPage() {
  const [activeId, setActiveId] = useState(PROPOSALS[0]?.id ?? null);

  if (!import.meta.env.DEV) {
    return <Navigate to="/login" replace />;
  }

  const active = PROPOSALS.find((p) => p.id === activeId);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.badge}>
          <Sparkles size={14} />
          Design Preview · solo desarrollo
        </span>
        <h1 className={styles.title}>Sandbox de propuestas de diseño</h1>
      </header>

      {PROPOSALS.length === 0 ? (
        <div className={styles.empty}>
          <p>Todavía no hay propuestas cargadas.</p>
          <p className={styles.emptyHint}>
            Pedí &quot;hazme algo en design preview&quot; para generar variantes acá.
          </p>
        </div>
      ) : (
        <>
          <nav className={styles.tabs}>
            {PROPOSALS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.tab} ${p.id === activeId ? styles.tabActive : ''}`}
                onClick={() => setActiveId(p.id)}
              >
                {p.label}
              </button>
            ))}
          </nav>
          <div className={styles.stage}>
            {active && <active.Component />}
          </div>
        </>
      )}
    </div>
  );
}
