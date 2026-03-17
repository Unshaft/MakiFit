import { useEffect, useRef } from 'react';

/**
 * Empêche l'écran de s'éteindre pendant le workout.
 * Se libère automatiquement au démontage du composant.
 */
export function useWakeLock(active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let released = false;

    navigator.wakeLock.request('screen').then(lock => {
      if (released) { lock.release(); return; }
      wakeLockRef.current = lock;
    }).catch(() => {
      // Permission refusée ou navigateur non supporté — silencieux
    });

    return () => {
      released = true;
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [active]);
}
