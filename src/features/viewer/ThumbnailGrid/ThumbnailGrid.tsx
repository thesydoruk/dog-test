import { ErrorState } from '@/shared/ui/ErrorState';
import { Loading } from '@/shared/ui/Loading';
import { RefreshIcon } from './RefreshIcon';
import { useSelection } from '../SelectionContext';
import { Thumbnail } from './Thumbnail';
import styles from './ThumbnailGrid.module.css';
import { THUMBNAIL_COUNT, useRandomDogs } from '../useRandomDogs';
import { useCurrentDog } from '../useCurrentDog';

/**
 * "More dogs": {@link THUMBNAIL_COUNT} random dogs as thumbnails, plus a "New dogs" button.
 *
 * Clicking a thumbnail makes it the main image; the thumbnail matching the main image is
 * highlighted. States:
 * - first load: one skeleton per thumbnail;
 * - error: a message with "Try again" (the "New dogs" button is hidden);
 * - refreshing: the old dogs stay visible but dimmed and inert (`aria-busy`), the icon spins and
 *   "Loading new dogs…" is announced. Clicks on "New dogs" are ignored until it finishes.
 *
 * The grid is mobile first: 2 columns, 3 from 480 px, 5 from 1024 px.
 *
 * Must be rendered inside {@link AppProviders}.
 */
export function ThumbnailGrid() {
  const { data: dogs, isPending, isError, isFetching, refetch } = useRandomDogs(THUMBNAIL_COUNT);
  const { selectDog } = useSelection();
  const { dog: currentDog } = useCurrentDog();
  const refreshing = isFetching && !isPending;

  return (
    <section className={styles.section} aria-labelledby="more-dogs-heading">
      <div className={styles.header}>
        <h2 id="more-dogs-heading" className={styles.heading}>
          More dogs
        </h2>
        {dogs && !isError && (
          <button
            type="button"
            className="button button--secondary"
            aria-disabled={refreshing}
            onClick={() => {
              if (!refreshing) void refetch();
            }}
          >
            <RefreshIcon spinning={refreshing} />
            New dogs
          </button>
        )}
      </div>

      {refreshing && (
        <span role="status" className="visually-hidden">
          Loading new dogs…
        </span>
      )}

      {isPending ? (
        <Loading label="Loading more dogs…">
          <ul className={styles.grid}>
            {Array.from({ length: THUMBNAIL_COUNT }, (_, index) => (
              <li key={index} className={`${styles.skeleton} skeleton`} />
            ))}
          </ul>
        </Loading>
      ) : isError ? (
        <ErrorState message="We couldn't fetch more dogs." onRetry={() => void refetch()} />
      ) : (
        <ul className={styles.grid} aria-busy={refreshing}>
          {dogs.map((dog, index) => (
            // The API may return the same photo twice, so the index keeps keys unique.
            <li key={`${index}-${dog.id}`}>
              <Thumbnail dog={dog} selected={dog.id === currentDog?.id} onSelect={selectDog} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
