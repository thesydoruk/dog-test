import { expect, SIDEBAR_BREAKPOINT, test } from './support/test';

/** Number of thumbnail columns the mobile-first grid uses at a given width. */
function expectedColumns(width: number): number {
  if (width >= 1024) return 5;
  if (width >= 480) return 3;
  return 2;
}

test.describe('Responsive layout', () => {
  test('the page never scrolls horizontally', async ({ viewer, page }) => {
    await viewer.open();
    await viewer.favoriteToggle.click();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('favorites sit on the right from tablet up and below the dogs on phones', async ({
    viewer,
  }) => {
    await viewer.open();

    const main = (await viewer.page.getByRole('main').boundingBox())!;
    const favorites = (await viewer.favorites.boundingBox())!;

    if (viewer.viewportWidth >= SIDEBAR_BREAKPOINT) {
      expect(favorites.x).toBeGreaterThanOrEqual(main.x + main.width);
      expect(favorites.y).toBeLessThan(main.y + main.height);
    } else {
      expect(favorites.y).toBeGreaterThanOrEqual(main.y + main.height);
      expect(Math.round(favorites.width)).toBe(Math.round(main.width));
    }
  });

  test('thumbnails use as many columns as the screen allows', async ({ viewer }) => {
    await viewer.open();

    const lefts = await viewer.thumbnails.evaluateAll((buttons) =>
      buttons.map((button) => Math.round(button.getBoundingClientRect().left)),
    );
    expect(new Set(lefts).size).toBe(expectedColumns(viewer.viewportWidth));
  });

  test('thumbnails are square-cropped and evenly sized', async ({ viewer }) => {
    await viewer.open();

    const frames = await viewer.thumbnails.evaluateAll((buttons) =>
      buttons.map((button) => {
        const frame = button.querySelector('img')!.getBoundingClientRect();
        return { width: Math.round(frame.width), height: Math.round(frame.height) };
      }),
    );
    for (const frame of frames) {
      expect(Math.abs(frame.width - frame.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.width - frames[0]!.width)).toBeLessThanOrEqual(1);
    }
  });

  test('the main image fills the content width and is visible without scrolling', async ({
    viewer,
    page,
  }) => {
    await viewer.open();

    const image = (await viewer.mainImage.boundingBox())!;
    const main = (await page.getByRole('main').boundingBox())!;
    const viewportHeight = page.viewportSize()!.height;

    expect(Math.round(image.width)).toBe(Math.round(main.width));
    expect(image.y).toBeLessThan(viewportHeight);
    expect(image.height).toBeGreaterThan(100);
  });

  test('every control is a comfortable touch target', async ({ viewer, page }) => {
    await viewer.open();
    await viewer.favoriteToggle.click();

    const tooSmall = await page.getByRole('button').evaluateAll((buttons) =>
      buttons
        .map((button) => {
          const { width, height } = button.getBoundingClientRect();
          return { name: button.getAttribute('aria-label') ?? button.textContent, width, height };
        })
        .filter(({ width, height }) => width < 44 || height < 44),
    );
    expect(tooSmall).toEqual([]);
  });

  test('long breed names wrap instead of overflowing', async ({ viewer }) => {
    await viewer.open();

    const overflowing = await viewer.thumbnails.evaluateAll((buttons) =>
      buttons.filter((button) => button.scrollWidth > button.clientWidth).map((b) => b.textContent),
    );
    expect(overflowing).toEqual([]);
  });

  test('the favorites panel stays in view while scrolling on larger screens', async ({
    viewer,
    page,
  }) => {
    test.skip(
      viewer.viewportWidth < SIDEBAR_BREAKPOINT,
      'Favorites are part of the flow on phones',
    );
    await viewer.open();

    const scrollable = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight,
    );
    test.skip(!scrollable, 'Page fits in the viewport, nothing to scroll');

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(viewer.favorites).toBeInViewport();
  });
});
