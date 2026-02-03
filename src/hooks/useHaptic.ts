import { useCallback } from 'react';
import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticSelection } from '../utils/haptics';

/**
 * Hook for haptic feedback
 * Provides memoized haptic functions for use in components
 */
export function useHaptic() {
  const light = useCallback(() => hapticLight(), []);
  const medium = useCallback(() => hapticMedium(), []);
  const success = useCallback(() => hapticSuccess(), []);
  const error = useCallback(() => hapticError(), []);
  const selection = useCallback(() => hapticSelection(), []);

  return {
    light,
    medium,
    success,
    error,
    selection,
  };
}
