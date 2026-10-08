import {
  isFullyInViewport,
  prefersReducedMotion,
  scrollBehavior,
  scrollIntoViewIfNeeded,
} from '../scroll';

function element(top: number, bottom: number) {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => ({ top, bottom }) as DOMRect;
  return el;
}

describe('prefersReducedMotion', () => {
  it('is false when matchMedia is unavailable', () => {
    expect(prefersReducedMotion()).toBe(false);
    expect(scrollBehavior()).toBe('smooth');
  });

  it('follows the media query', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(prefersReducedMotion()).toBe(true);
    expect(scrollBehavior()).toBe('auto');
    vi.unstubAllGlobals();
  });
});

describe('isFullyInViewport', () => {
  it.each([
    [0, 100, true],
    [10, 768, true],
    [-1, 100, false],
    [10, 769, false],
  ])('top %i / bottom %i → %s', (top, bottom, expected) => {
    expect(isFullyInViewport(element(top, bottom))).toBe(expected);
  });
});

describe('scrollIntoViewIfNeeded', () => {
  it('ignores a missing element or one without scrollIntoView', () => {
    expect(() => scrollIntoViewIfNeeded(null)).not.toThrow();
    expect(() => scrollIntoViewIfNeeded(element(-50, 100))).not.toThrow();
  });

  it('does not scroll when the element is already visible', () => {
    const el = element(10, 100);
    el.scrollIntoView = vi.fn();
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls smoothly to an element outside the viewport', () => {
    const el = element(900, 1200);
    el.scrollIntoView = vi.fn();
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
  });

  it('scrolls instantly when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const el = element(-100, 50);
    el.scrollIntoView = vi.fn();
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' });
    vi.unstubAllGlobals();
  });
});
