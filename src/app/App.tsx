import { AddToFavoritesButton } from '@/features/favorites/AddToFavoritesButton';
import { FavoritesPanel } from '@/features/favorites/FavoritesPanel';
import { MainDog } from '@/features/viewer/MainDog';
import { useSelection } from '@/features/viewer/SelectionContext';
import { ThumbnailGrid } from '@/features/viewer/ThumbnailGrid';
import { useCurrentDog } from '@/features/viewer/useCurrentDog';
import styles from './App.module.css';

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
        <MainDog renderActions={(dog) => <AddToFavoritesButton dog={dog} />} />
        <ThumbnailGrid />
      </main>

      <div className={styles.sidebar}>
        <FavoritesPanel selectedId={currentDog?.id ?? null} onSelect={selectDog} />
      </div>
    </div>
  );
}
