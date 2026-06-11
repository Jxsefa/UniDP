import { FALLBACK_COLORS, getInitials } from '../../utils/eventFormat';
import styles from './InteresadosAvatars.module.css';

export default function InteresadosAvatars({ interesados, extraCount }) {
  if (!interesados.length) return null;
  return (
    <div className={styles.avatarStack}>
      {interesados.map((u, i) => (
        u.foto_url ? (
          <img
            key={u.id}
            src={u.foto_url}
            alt={u.nombre}
            className={styles.miniAvatar}
          />
        ) : (
          <div
            key={u.id}
            className={styles.miniAvatar}
            style={{ background: FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
          >
            <span className={styles.miniAvatarInitials}>{getInitials(u.nombre)}</span>
          </div>
        )
      ))}
      {extraCount > 0 && (
        <div className={`${styles.miniAvatar} ${styles.miniAvatarMore}`}>
          <span className={styles.miniAvatarInitials}>+{extraCount}</span>
        </div>
      )}
    </div>
  );
}
