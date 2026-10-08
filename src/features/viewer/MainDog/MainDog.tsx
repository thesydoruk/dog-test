import { useEffect, useRef, type ReactNode } from 'react';
import type { Dog } from '@/domain/dog';
import { scrollIntoViewIfNeeded } from '@/shared/dom/scroll';
import { DogImage } from '@/shared/ui/DogImage';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Loading } from '@/shared/ui/Loading';
import styles from './MainDog.module.css';
import { useCurrentDog } from '../useCurrentDog';

/** Props for {@link MainDog}. */
interface MainDogProps {
  /**
   * Renders controls under the photo for the dog being shown (e.g. the favorites button).
   *
   * A slot instead of a direct import keeps the viewer feature independent of favorites; `App`
   * wires them together. Not called while loading or on error.
   *
   * @example
   * ```tsx
   * <MainDog renderActions={(dog) => <AddToFavoritesButton dog={dog} />} />
   * ```
   */
  renderActions?: (dog: Dog) => ReactNode;
}

/**
 * The featured dog: a large photo labelled with its breed, in a "Featured dog" region.
 *
 * Shows the dog from {@link useCurrentDog}: the user's pick, or the random dog until they pick
 * one. While the random dog loads it shows a skeleton, and if loading fails (and nothing is
 * picked) an error with "Try again".
 *
 * The photo is shown whole (`object-fit: contain`) over a blurred copy of itself that fills the
 * letterbox, and loads eagerly with high priority as the page's main image. When the user picks
 * another dog and the photo is off screen (phones), it scrolls back into view; the initial load
 * never scrolls.
 *
 * Must be rendered inside {@link AppProviders}.
 */
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
