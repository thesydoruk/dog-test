import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import type { Dog } from '@/domain/dog';
import { FavoritesProvider } from '@/features/favorites/FavoritesContext';
import { SelectionProvider } from '@/features/viewer/SelectionContext';
import { createQueryClient } from './queryClient';

interface AppProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  initialFavorites?: Dog[];
}

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
