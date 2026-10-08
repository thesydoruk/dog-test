import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import type { Dog } from '@/domain/dog';
import { FavoritesProvider } from '@/features/favorites/FavoritesContext';
import { SelectionProvider } from '@/features/viewer/SelectionContext';
import { createQueryClient } from './queryClient';

/** Props for {@link AppProviders}. */
interface AppProvidersProps {
  /** The tree that needs server state, favorites and the current selection. */
  children: ReactNode;
  /**
   * Query client to use instead of the app default from {@link createQueryClient}.
   * Tests pass one with retries turned off.
   */
  queryClient?: QueryClient;
  /**
   * Favorites to start with instead of the ones saved in `localStorage`.
   * Tests use it to render a known list; the app leaves it unset.
   */
  initialFavorites?: Dog[];
}

/**
 * Every context the app needs, in dependency order: TanStack Query for server state, then
 * favorites, then the selected dog.
 *
 * The query client is created once per mount and kept for the component's lifetime, so a
 * re-render never throws away the cache.
 *
 * @example
 * ```tsx
 * createRoot(container).render(
 *   <AppProviders>
 *     <App />
 *   </AppProviders>,
 * );
 * ```
 */
export function AppProviders({ children, queryClient, initialFavorites }: AppProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());

  return (
    <QueryClientProvider client={client}>
      <FavoritesProvider initialFavorites={initialFavorites}>
        <SelectionProvider>{children}</SelectionProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}
