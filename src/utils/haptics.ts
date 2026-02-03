/**
 * Haptic feedback utilities for mobile devices
 * Uses the Vibration API when available
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

const patterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  error: [50, 100, 50],
  selection: 5,
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 */
export function haptic(type: HapticType = 'light'): void {
  if (!isHapticSupported()) return;

  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Silently fail if vibration is not allowed
  }
}

/**
 * Light tap feedback - for button presses
 */
export function hapticLight(): void {
  haptic('light');
}

/**
 * Medium feedback - for confirmations
 */
export function hapticMedium(): void {
  haptic('medium');
}

/**
 * Heavy feedback - for important actions
 */
export function hapticHeavy(): void {
  haptic('heavy');
}

/**
 * Success pattern - for completed actions
 */
export function hapticSuccess(): void {
  haptic('success');
}

/**
 * Error pattern - for failed actions
 */
export function hapticError(): void {
  haptic('error');
}

/**
 * Selection feedback - for toggles and selections
 */
export function hapticSelection(): void {
  haptic('selection');
}
