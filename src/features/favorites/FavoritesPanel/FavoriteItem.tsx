import type { Dog } from '@/domain/dog';
import { DogImage } from '@/shared/ui/DogImage';
import styles from './FavoriteItem.module.css';

interface FavoriteItemProps {
  dog: Dog;
  selected: boolean;
  onSelect: (dog: Dog) => void;
  onRemove: (dog: Dog) => void;
}

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
