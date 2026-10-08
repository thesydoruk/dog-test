import { AddToFavoritesButton } from '@/features/favorites/AddToFavoritesButton';
import { FavoritesAnnouncer } from '@/features/favorites/FavoritesAnnouncer';
import { FavoritesJumpLink } from '@/features/favorites/FavoritesJumpLink';
import { FavoritesPanel } from '@/features/favorites/FavoritesPanel';
import { MainDog } from '@/features/viewer/MainDog';
import { useSelection } from '@/features/viewer/SelectionContext';
import { ThumbnailGrid } from '@/features/viewer/ThumbnailGrid';
import { useCurrentDog } from '@/features/viewer/useCurrentDog';
import styles from './App.module.css';

/**
 * The whole Dog Viewer page: header, the featured dog with its thumbnails, and the favorites
 * panel.
 *
 * This is the only place where the `viewer` and `favorites` features meet. The favorites button
 * reaches {@link MainDog} through its `renderActions` slot, and the panel gets the current
 * selection via props, so neither feature imports the other.
 *
 * Layout is mobile first: one column on phones (favorites below the dogs), favorites on the
 * right from 768 px up.
 *
 * Must be rendered inside {@link AppProviders}.
 */
export function App() {
  const { selectDog } = useSelection();
  const { dog: currentDog } = useCurrentDog();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dog Viewer</h1>
        <p className={styles.subtitle}>Random dogs from the Dog API</p>
      </header>

      <main className={styles.main}>
        <MainDog
          renderActions={(dog) => (
            <div className={styles.actions}>
              <AddToFavoritesButton dog={dog} />
              <FavoritesJumpLink />
            </div>
          )}
        />
        <ThumbnailGrid />
      </main>

      <div className={styles.sidebar}>
        <FavoritesPanel selectedId={currentDog?.id ?? null} onSelect={selectDog} />
      </div>

      <FavoritesAnnouncer />
    </div>
  );
}
