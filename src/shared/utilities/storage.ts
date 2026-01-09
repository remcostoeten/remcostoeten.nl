export const STORAGE_KEYS = {
  TIMER_HIDDEN: 'timer-hidden',
  TIMER_ANIMATION_DISABLED: 'timer-animation-disabled'
} as const;

export function setTimerHidden(hidden: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TIMER_HIDDEN, String(hidden));
}

export function isTimerHidden(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.TIMER_HIDDEN) === 'true';
}

export function setTimerAnimationDisabled(disabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TIMER_ANIMATION_DISABLED, String(disabled));
}

export function isTimerAnimationDisabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.TIMER_ANIMATION_DISABLED) === 'true';
}