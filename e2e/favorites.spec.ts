import { byBreed, MAIN_DOG } from './support/fixtures';
import { expect, SIDEBAR_BREAKPOINT, test } from './support/test';

test.describe('Part 2: favorites', () => {
  test('starts with an empty favorites list', async ({ viewer }) => {
    await viewer.open();

    await expect(viewer.favorites).toBeVisible();
    await expect(viewer.favoritesCount).toHaveText('0');
    await expect(viewer.emptyFavorites).toBeVisible();
    await expect(viewer.favoriteItems).toHaveCount(0);
  });

  test('the favorites button adds the main dog to the list', async ({ viewer }) => {
    await viewer.open();

    await expect(viewer.favoriteToggle).toHaveText('Add to favorites');
    await viewer.favoriteToggle.click();

    await expect(viewer.favoriteToggle).toHaveText('Remove from favorites');
    await expect(viewer.emptyFavorites).toHaveCount(0);
    await expect(viewer.favoritesCount).toHaveText('1');
    await expect(viewer.favoriteItems).toHaveText([MAIN_DOG.breed]);
    await expect(viewer.favorite(MAIN_DOG.breed).locator('img')).toHaveAttribute(
      'src',
      MAIN_DOG.url,
    );
    // The favorite matches what is on screen, so it is highlighted.
    await expect(viewer.favorite(MAIN_DOG.breed)).toHaveAttribute('aria-pressed', 'true');
  });

  test('the same dog is never added twice', async ({ viewer }) => {
    await viewer.open();

    await viewer.favoriteToggle.click();
    await viewer.pickThumbnail('Pug');
    await viewer.pickFavorite(MAIN_DOG.breed);

    await expect(viewer.favoriteToggle).toHaveText('Remove from favorites');
    await expect(viewer.favoriteItems).toHaveCount(1);
  });

  test('pressing the button again takes the dog out of favorites', async ({ viewer }) => {
    await viewer.open();

    await viewer.favoriteToggle.click();
    await viewer.favoriteToggle.click();

    await expect(viewer.favoriteToggle).toHaveText('Add to favorites');
    await expect(viewer.emptyFavorites).toBeVisible();
  });

  test('favorites keep the order they were added in', async ({ viewer }) => {
    await viewer.open();

    await viewer.favoriteToggle.click();
    for (const breed of ['Pug', 'Beagle', 'Husky']) {
      await viewer.pickThumbnail(breed);
      await viewer.favoriteToggle.click();
    }

    await expect(viewer.favoritesCount).toHaveText('4');
    await expect(viewer.favoriteItems).toHaveText([MAIN_DOG.breed, 'Pug', 'Beagle', 'Husky']);
  });

  test('clicking a favorite shows its image and breed as the main image', async ({ viewer }) => {
    await viewer.open();
    const pug = byBreed('Pug');

    await viewer.favoriteToggle.click();
    await viewer.pickThumbnail(pug.breed);
    await viewer.favoriteToggle.click();
    await viewer.pickThumbnail('Beagle');

    await viewer.pickFavorite(MAIN_DOG.breed);
    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);
    await expect(viewer.favorite(MAIN_DOG.breed)).toHaveAttribute('aria-pressed', 'true');
    await expect(viewer.favorite(pug.breed)).toHaveAttribute('aria-pressed', 'false');
    await expect(viewer.favoriteToggle).toHaveText('Remove from favorites');

    await viewer.pickFavorite(pug.breed);
    await viewer.expectMainDog(pug.breed, pug.url);
    // The thumbnail of the same photo is highlighted as well.
    await expect(viewer.thumbnail(pug.breed)).toHaveAttribute('aria-pressed', 'true');
  });

  test('each favorite has a button that removes it', async ({ viewer }) => {
    await viewer.open();

    await viewer.favoriteToggle.click();
    await viewer.pickThumbnail('Pug');
    await viewer.favoriteToggle.click();

    await expect(viewer.removeFavoriteButton(MAIN_DOG.breed)).toBeVisible();
    await expect(viewer.removeFavoriteButton('Pug')).toBeVisible();

    await viewer.removeFavoriteButton(MAIN_DOG.breed).click();
    await expect(viewer.favoriteItems).toHaveText(['Pug']);
    await expect(viewer.favoritesCount).toHaveText('1');
    // The shown dog (Pug) is still a favorite.
    await expect(viewer.favoriteToggle).toHaveText('Remove from favorites');

    await viewer.removeFavoriteButton('Pug').click();
    await expect(viewer.emptyFavorites).toBeVisible();
    await expect(viewer.favoritesCount).toHaveText('0');
    await expect(viewer.favoriteToggle).toHaveText('Add to favorites');
  });

  test('removing a favorite keeps the main image', async ({ viewer }) => {
    await viewer.open();

    await viewer.favoriteToggle.click();
    await viewer.removeFavoriteButton(MAIN_DOG.breed).click();

    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);
  });

  test('favorites can be managed with the keyboard', async ({ viewer, page }) => {
    await viewer.open();

    await viewer.favoriteToggle.focus();
    await page.keyboard.press('Enter');
    await viewer.thumbnail('Pug').focus();
    await page.keyboard.press('Enter');
    await viewer.favoriteToggle.focus();
    await page.keyboard.press('Enter');
    await expect(viewer.favoriteItems).toHaveCount(2);

    await viewer.favorite(MAIN_DOG.breed).focus();
    await page.keyboard.press('Enter');
    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);

    // Removing moves focus to the next favorite, then to the heading.
    await viewer.removeFavoriteButton(MAIN_DOG.breed).focus();
    await page.keyboard.press('Enter');
    await expect(viewer.favorite('Pug')).toBeFocused();

    await viewer.removeFavoriteButton('Pug').focus();
    await page.keyboard.press('Enter');
    await expect(viewer.favorites.getByRole('heading')).toBeFocused();
  });

  test('changes are announced to assistive technology', async ({ viewer }) => {
    await viewer.open();
    await expect(viewer.announcer).toHaveCount(0);

    await viewer.favoriteToggle.click();
    await expect(viewer.announcer).toHaveText('Afghan Hound added to favorites');

    await viewer.removeFavoriteButton(MAIN_DOG.breed).click();
    await expect(viewer.announcer).toHaveText('Afghan Hound removed from favorites');
  });

  test('on phones a link next to the button counts favorites and jumps to the list', async ({
    viewer,
    page,
  }) => {
    await viewer.open();

    if (viewer.viewportWidth >= SIDEBAR_BREAKPOINT) {
      // The list is already beside the dogs, so there is nothing to jump to.
      await expect(viewer.favoritesJumpLink).toBeHidden();
      return;
    }

    await expect(viewer.favoritesJumpLink).toHaveText('Favorites (0)');
    await expect(viewer.favorites).not.toBeInViewport();

    await viewer.favoriteToggle.click();
    await expect(viewer.favoritesJumpLink).toHaveText('Favorites (1)');

    await viewer.favoritesJumpLink.click();
    await expect(viewer.favorites.getByRole('heading')).toBeFocused();
    await expect(viewer.favorites).toBeInViewport();
    expect(page.url()).not.toContain('#');
  });

  test('favorites survive a page reload', async ({ viewer, page }) => {
    await viewer.open();

    await viewer.favoriteToggle.click();
    await viewer.pickThumbnail('Beagle');
    await viewer.favoriteToggle.click();

    await page.reload();
    await expect(viewer.mainBreed).toBeVisible();

    await expect(viewer.favoriteItems).toHaveText([MAIN_DOG.breed, 'Beagle']);
    await viewer.pickFavorite('Beagle');
    await viewer.expectMainDog('Beagle', byBreed('Beagle').url);
  });

  test('a long favorites list stays usable', async ({ viewer }) => {
    await viewer.open();

    await viewer.favoriteToggle.click();
    for (let index = 0; index < 10; index += 1) {
      await viewer.pickThumbnailAt(index);
      await viewer.favoriteToggle.click();
    }
    await expect(viewer.favoritesCount).toHaveText('11');

    const last = viewer.favorite('English Cocker Spaniel');
    await last.click();
    await viewer.expectMainDog('English Cocker Spaniel', byBreed('English Cocker Spaniel').url);
    await viewer.removeFavoriteButton('English Cocker Spaniel').click();
    await expect(viewer.favoritesCount).toHaveText('10');
  });
});
