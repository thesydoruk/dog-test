import type { MouseEvent } from 'react';
import { scrollBehavior } from '@/shared/dom/scroll';
import { FAVORITES_HEADING_ID } from '../constants';
import { useFavorites } from '../FavoritesContext';
import styles from './FavoritesJumpLink.module.css';

/**
 * "Favorites (n) ↓" link that jumps to the favorites list.
 *
 * On phones the list sits below the thumbnails, out of sight of the favorites button; this link
 * shows the count and scrolls to the list (smoothly, unless reduced motion is preferred), then
 * moves focus to the list heading so keyboard and screen reader users land there too. From
 * 768 px up the list is beside the dogs, so CSS hides the link.
 *
 * It is a real `#favorites-heading` anchor, so it still works if the panel isn't rendered.
 *
 * Must be rendered inside {@link FavoritesProvider}, on the same page as {@link FavoritesPanel}.
 */
export function FavoritesJumpLink() {
  const { favorites } = useFavorites();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const heading = document.getElementById(FAVORITES_HEADING_ID);
    if (!heading) return;
    event.preventDefault();
    heading.scrollIntoView?.({ block: 'start', behavior: scrollBehavior() });
    heading.focus({ preventScroll: true });
  };

  return (
    <a href={`#${FAVORITES_HEADING_ID}`} className={styles.link} onClick={handleClick}>
      Favorites ({favorites.length})
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4v16M5 13l7 7 7-7" />
      </svg>
    </a>
  );
}
