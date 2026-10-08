import { QueryClient } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { AppProviders } from '@/app/providers';
import type { Dog } from '@/domain/dog';

interface ProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialFavorites?: Dog[];
  queryClient?: QueryClient;
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { initialFavorites, queryClient = createTestQueryClient(), ...options }: ProvidersOptions = {},
) {
  const user = userEvent.setup();
  const result = render(ui, {
    wrapper: ({ children }) => (
      <AppProviders queryClient={queryClient} initialFavorites={initialFavorites}>
        {children}
      </AppProviders>
    ),
    ...options,
  });
  return { user, queryClient, ...result };
}
