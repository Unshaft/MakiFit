/**
 * Calcule le nouveau streak après une activité.
 *
 * Règles :
 * - Dernière session = aujourd'hui  → pas d'incrément (déjà compté)
 * - Dernière session = hier          → streak + 1 (continuité)
 * - Dernière session = null ou plus vieux → repart à 1
 */
export function calculateNewStreak(currentStreak: number, lastSessionDate: string | null): number {
  if (!lastSessionDate) return 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const last = new Date(lastSessionDate);
  last.setHours(0, 0, 0, 0);

  if (last.getTime() === today.getTime()) return currentStreak;      // déjà fait aujourd'hui
  if (last.getTime() === yesterday.getTime()) return currentStreak + 1; // continuité
  return 1;                                                             // streak cassé
}

/**
 * Vérifie si on a déjà une session aujourd'hui (pour éviter les doublons).
 */
export function hasSessionToday(lastSessionDate: string | null): boolean {
  if (!lastSessionDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastSessionDate);
  last.setHours(0, 0, 0, 0);
  return last.getTime() === today.getTime();
}
