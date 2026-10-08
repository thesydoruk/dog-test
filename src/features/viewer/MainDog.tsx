import { useEffect, useRef, type ReactNode } from 'react';
import type { Dog } from '@/domain/dog';
import { scrollIntoViewIfNeeded } from '@/shared/dom/scroll';
import { DogImage } from '@/shared/ui/DogImage';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loading } from '@/shared/ui/Loading';
import styles from './MainDog.module.css';
import { useCurrentDog } from './useCurrentDog';

interface MainDogProps {
  /** Slot for actions on the shown dog (e.g. favoriting), so this feature stays decoupled. */
  renderActions?: (dog: Dog) => ReactNode;
}

export function MainDog({ renderActions }: MainDogProps) {
  const { dog, isPending, refetch } = useCurrentDog();
  const frameRef = useRef<HTMLDivElement>(null);
  const shownDogId = useRef<string | null>(null);

  // On small screens the thumbnails sit below the fold, so picking one would change
  // the main image out of sight. Bring it back into view, but not on the initial load.
  useEffect(() => {
    if (!dog) return;
    const previous = shownDogId.current;
    shownDogId.current = dog.id;
    if (previous !== null && previous !== dog.id) scrollIntoViewIfNeeded(frameRef.current);
  }, [dog]);

  return (
    <section className={styles.section} aria-labelledby="main-dog-heading">
      <h2 id="main-dog-heading" className="visually-hidden">
        Featured dog
      </h2>

      {dog ? (
        <figure className={styles.figure}>
          <div className={styles.frame} ref={frameRef}>
            <div
              className={styles.backdrop}
              style={{ backgroundImage: `url("${dog.imageUrl}")` }}
              aria-hidden="true"
            />
            <DogImage
              src={dog.imageUrl}
              alt={dog.breed.name}
              className={styles.image}
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <figcaption className={styles.caption}>
            <p className={styles.breed} data-testid="main-dog-breed">
              {dog.breed.name}
            </p>
            {renderActions?.(dog)}
          </figcaption>
        </figure>
      ) : isPending ? (
        <Loading label="Loading a dog…">
          <div className={`${styles.frame} skeleton`} />
          <div className={styles.caption}>
            <div className={`${styles.breedSkeleton} skeleton`} />
          </div>
        </Loading>
      ) : (
        <ErrorState message="We couldn't fetch a dog right now." onRetry={() => void refetch()} />
      )}
    </section>
  );
}
