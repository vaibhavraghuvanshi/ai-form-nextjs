/**
 * Mock for @/hooks/usePrefersReducedMotion
 *
 * Default: returns false (animations enabled).
 * Override per-test:
 *   jest.mock('@/hooks/usePrefersReducedMotion');
 *   import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
 *   (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);
 */
export const usePrefersReducedMotion = jest.fn(() => false);
