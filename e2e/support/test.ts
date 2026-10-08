import { test as base, type Locator } from '@playwright/test';
import { DogApiMock } from './dogApiMock';
import { DogViewerPage } from './DogViewerPage';

export { expect } from '@playwright/test';

interface Fixtures {
  dogApi: DogApiMock;
  viewer: DogViewerPage;
}

export const test = base.extend<Fixtures>({
  dogApi: async ({ page }, use) => {
    const mock = new DogApiMock(page);
    await mock.install();
    await use(mock);
  },
  // Depends on `dogApi` so the network is always mocked before the page loads.
  viewer: async ({ page, dogApi }, use) => {
    void dogApi;
    await use(new DogViewerPage(page));
  },
});

/** Breakpoint at which favorites move from below the dogs to the right-hand side. */
export const SIDEBAR_BREAKPOINT = 768;

/** Reads the current CSS scale of an element (1 when it isn't transformed). */
export function scaleOf(locator: Locator): Promise<number> {
  return locator.evaluate((element) => {
    const { transform } = getComputedStyle(element);
    return transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a;
  });
}
