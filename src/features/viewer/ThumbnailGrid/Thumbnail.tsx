import type { Dog } from '@/domain/dog';
import { DogImage } from '@/shared/ui/DogImage';
import styles from './Thumbnail.module.css';

interface ThumbnailProps {
  dog: Dog;
  selected: boolean;
  onSelect: (dog: Dog) => void;
}

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
