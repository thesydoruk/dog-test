export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

export function isFullyInViewport(element: Element): boolean {
  const { top, bottom } = element.getBoundingClientRect();
  return top >= 0 && bottom <= window.innerHeight;
}

/** Scrolls an element to the top of the viewport unless it is already fully visible. */
export function scrollIntoViewIfNeeded(element: HTMLElement | null): void {
  // jsdom has no scrollIntoView, so the guard keeps component tests simple.
  if (!element || typeof element.scrollIntoView !== 'function') return;
  if (isFullyInViewport(element)) return;
  element.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
}
