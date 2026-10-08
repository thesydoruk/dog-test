import { useEffect, useRef } from 'react';
import type { Dog } from '@/domain/dog';
import { FAVORITES_HEADING_ID } from './constants';
import { FavoriteItem } from './FavoriteItem';
import { useFavorites } from './FavoritesContext';
import styles from './FavoritesPanel.module.css';

interface FavoritesPanelProps {
  selectedId: string | null;
  onSelect: (dog: Dog) => void;
}

export function FavoritesPanel({ selectedId, onSelect }: FavoritesPanelProps) {
  const { favorites, removeFavorite } = useFavorites();
  const listRef = useRef<HTMLUListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusIndexAfterRemove = useRef<number | null>(null);

  // Removing the focused item would drop focus to <body>; move it to the next
  // favorite instead (or the heading once the list is empty).
  useEffect(() => {
    const index = focusIndexAfterRemove.current;
    if (index === null) return;
    focusIndexAfterRemove.current = null;
    const items = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-favorite-select]');
    const target = items?.[Math.min(index, items.length - 1)] ?? headingRef.current;
    target?.focus();
  }, [favorites]);

  const handleRemove = (dog: Dog) => {
    focusIndexAfterRemove.current = favorites.findIndex((favorite) => favorite.id === dog.id);
    removeFavorite(dog.id);
  };

  return (
    <aside className={styles.panel} aria-labelledby={FAVORITES_HEADING_ID}>
      <h2 id={FAVORITES_HEADING_ID} className={styles.heading} ref={headingRef} tabIndex={-1}>
        Favorites{' '}
        <span className={styles.count}>
          <span data-testid="favorites-count">{favorites.length}</span>
          <span className="visually-hidden"> saved</span>
        </span>
      </h2>

      {favorites.length === 0 ? (
        <p className={styles.empty}>
          No favorites yet. Use “Add to favorites” to keep the dogs you like here.
        </p>
      ) : (
        <ul className={styles.list} ref={listRef}>
          {favorites.map((dog) => (
            <li key={dog.id}>
              <FavoriteItem
                dog={dog}
                selected={dog.id === selectedId}
                onSelect={onSelect}
                onRemove={handleRemove}
              />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
