/**
 * Scrolling helpers that respect the user's reduced-motion preference.
 *
 * @module
 */

/**
 * Whether the user asked the OS to minimise motion (`prefers-reduced-motion: reduce`).
 *
 * @returns `false` when `matchMedia` is unavailable (e.g. jsdom).
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * The `behavior` to pass to `scrollIntoView` / `scrollTo`: `'smooth'`, or `'auto'` (instant) when
 * reduced motion is preferred.
 *
 * @example
 * ```ts
 * heading.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
 * ```
 */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/**
 * Whether the whole element is inside the viewport vertically.
 *
 * Horizontal position is ignored: the layout never scrolls sideways.
 */
export function isFullyInViewport(element: Element): boolean {
  const { top, bottom } = element.getBoundingClientRect();
  return top >= 0 && bottom <= window.innerHeight;
}

/**
 * Scrolls an element to the top of the viewport unless it is already fully visible.
 *
 * Smooth unless reduced motion is preferred. Safe to call with `null` (e.g. an unset ref) or in
 * environments without `scrollIntoView`; it then does nothing.
 *
 * @param element - The element to bring into view. Give it `scroll-margin-top` in CSS to keep
 * some space above it.
 */
export function scrollIntoViewIfNeeded(element: HTMLElement | null): void {
  // jsdom has no scrollIntoView, so the guard keeps component tests simple.
  if (!element || typeof element.scrollIntoView !== 'function') return;
  if (isFullyInViewport(element)) return;
  element.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
}
