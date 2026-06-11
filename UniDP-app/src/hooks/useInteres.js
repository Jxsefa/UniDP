import { useEffect, useState } from 'react';
import { toggleInteres, checkInteres, getInteresCount, getInteresados } from '../services/events.service';

export function useInteres(event, userId) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [interesados, setInteresados] = useState([]);
  const [busy, setBusy] = useState(false);
  const [cupoLleno, setCupoLleno] = useState(false);

  useEffect(() => {
    function load() {
      Promise.all([
        userId ? checkInteres(userId, event.id) : Promise.resolve(false),
        getInteresCount(event.id),
        getInteresados(event.id),
      ]).then(([isLiked, cnt, users]) => {
        setLiked(isLiked);
        setCount(cnt);
        setInteresados(users);
      }).catch(() => {});
    }

    load();

    function handleInteresChanged(e) {
      if (e.detail?.eventoId === event.id) load();
    }

    window.addEventListener('interes-changed', handleInteresChanged);
    return () => window.removeEventListener('interes-changed', handleInteresChanged);
  }, [userId, event.id]);

  async function toggle() {
    if (!userId || busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setCount(c => c + (next ? 1 : -1));
    try {
      await toggleInteres(userId, event.id);
      const users = await getInteresados(event.id);
      setInteresados(users);
      window.dispatchEvent(new CustomEvent('interes-changed', {
        detail: { eventoId: event.id, liked: next },
      }));
    } catch (err) {
      setLiked(!next);
      setCount(c => c + (next ? -1 : 1));
      if (err?.message === 'CUPO_LLENO') setCupoLleno(true);
    } finally {
      setBusy(false);
    }
  }

  const cupos = event.capacidad ?? null;
  const cuposRestantes = cupos != null ? Math.max(0, cupos - count) : null;
  const pocosCupos = cupos != null && cuposRestantes > 0 && cuposRestantes <= Math.ceil(cupos * 0.1);
  const sinCupos = cupos != null && cuposRestantes === 0;

  return {
    liked, count, interesados, busy, cupoLleno, toggle,
    cupos, cuposRestantes, pocosCupos, sinCupos,
  };
}
