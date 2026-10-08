import type { Dog } from '@/domain/dog';
import { DogImage } from '@/shared/ui/DogImage';
import styles from './FavoriteItem.module.css';

/** Props for {@link FavoriteItem}. */
interface FavoriteItemProps {
  /** The saved dog to show. */
  dog: Dog;
  /** Whether this dog is the main image right now; highlights the row and sets `aria-pressed`. */
  selected: boolean;
  /** Called when the row is clicked, to show this dog as the main image. */
  onSelect: (dog: Dog) => void;
  /** Called when the × button is clicked. */
  onRemove: (dog: Dog) => void;
}

/**
 * One row of the favorites list: a thumbnail with the breed name that selects the dog, and an
 * icon-only remove button labelled "Remove {breed} from favorites".
 *
 * Both controls are at least 44 × 44 px for touch. The select button carries
 * `data-favorite-select`, which {@link FavoritesPanel} uses to move focus after a removal.
 *
 * Private to `FavoritesPanel`.
 */
export function FavoriteItem({ dog, selected, onSelect, onRemove }: FavoriteItemProps) {
  return (
    <div className={styles.item}>
      <button
        type="button"
        className={styles.select}
        aria-pressed={selected}
        data-favorite-select=""
        onClick={() => onSelect(dog)}
      >
        <DogImage src={dog.imageUrl} alt="" className={styles.thumb} />
        <span className={styles.name}>{dog.breed.name}</span>
      </button>
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remove ${dog.breed.name} from favorites`}
        onClick={() => onRemove(dog)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
