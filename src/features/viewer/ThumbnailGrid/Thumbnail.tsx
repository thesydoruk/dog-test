import type { Dog } from '@/domain/dog';
import { DogImage } from '@/shared/ui/DogImage';
import styles from './Thumbnail.module.css';

/** Props for {@link Thumbnail}. */
interface ThumbnailProps {
  /** The dog to show. */
  dog: Dog;
  /** Whether this dog is the main image right now; highlights the card and sets `aria-pressed`. */
  selected: boolean;
  /** Called when the card is clicked or activated with Enter / Space. */
  onSelect: (dog: Dog) => void;
}

/**
 * A square-cropped dog photo with its breed name, as one button.
 *
 * The breed name is the button's accessible name (the image itself is decorative). On devices
 * that can hover the card grows slightly on hover and on keyboard focus; the growth is animated
 * only when reduced motion isn't preferred.
 *
 * Private to `ThumbnailGrid`.
 */
export function Thumbnail({ dog, selected, onSelect }: ThumbnailProps) {
  return (
    <button
      type="button"
      className={styles.thumbnail}
      aria-pressed={selected}
      onClick={() => onSelect(dog)}
    >
      <span className={styles.frame}>
        <DogImage src={dog.imageUrl} alt="" />
      </span>
      <span className={styles.breed}>{dog.breed.name}</span>
    </button>
  );
}
