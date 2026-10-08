import { expect, scaleOf, test } from './support/test';

test.describe('Thumbnail hover', () => {
  test('a thumbnail smoothly grows slightly on hover and shrinks back', async ({
    viewer,
    page,
  }) => {
    await viewer.open();
    const thumbnail = viewer.thumbnail('Pug');

    const transition = await thumbnail.evaluate((element) => {
      const style = getComputedStyle(element);
      return { property: style.transitionProperty, duration: style.transitionDuration };
    });
    expect(transition.property).toContain('transform');
    expect(parseFloat(transition.duration)).toBeGreaterThan(0);

    expect(await scaleOf(thumbnail)).toBe(1);

    await thumbnail.hover();
    await expect.poll(() => scaleOf(thumbnail)).toBeCloseTo(1.06, 2);

    // Only the hovered thumbnail grows.
    expect(await scaleOf(viewer.thumbnail('Husky'))).toBe(1);

    await page.mouse.move(0, 0);
    await expect.poll(() => scaleOf(thumbnail)).toBe(1);
  });

  test('the grown thumbnail is not clipped by its neighbours', async ({ viewer }) => {
    await viewer.open();
    const thumbnail = viewer.thumbnail('Pug');

    await thumbnail.hover();
    await expect.poll(() => scaleOf(thumbnail)).toBeCloseTo(1.06, 2);
    const zIndex = await thumbnail.evaluate((element) => getComputedStyle(element).zIndex);
    expect(Number(zIndex)).toBeGreaterThan(0);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the thumbnail still grows but without animation', async ({ viewer }) => {
      await viewer.open();
      const thumbnail = viewer.thumbnail('Pug');

      const duration = await thumbnail.evaluate(
        (element) => getComputedStyle(element).transitionDuration,
      );
      expect(parseFloat(duration)).toBe(0);

      await thumbnail.hover();
      await expect.poll(() => scaleOf(thumbnail)).toBeCloseTo(1.06, 2);
    });
  });
});
