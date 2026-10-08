import type { ReactNode } from 'react';
import type { Dog } from '@/domain/dog';
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

  return (
    <section className={styles.section} aria-labelledby="main-dog-heading">
      <h2 id="main-dog-heading" className="visually-hidden">
        Featured dog
      </h2>

      {dog ? (
        <figure className={styles.figure}>
          <div className={styles.frame}>
            <DogImage
              src={dog.imageUrl}
              alt={dog.breed.name}
              className={styles.image}
              loading="eager"
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
