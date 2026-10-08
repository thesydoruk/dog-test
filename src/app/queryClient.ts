import { QueryClient } from '@tanstack/react-query';

/**
 * Creates the TanStack Query client with the app's defaults.
 *
 * - `staleTime: Infinity`, no refetch on window focus or reconnect: the random endpoints return
 *   different dogs on every call, so a background refetch would swap the photos under the user.
 *   New data only arrives when the user asks for it ("New dogs", "Try again").
 * - `retry: 1`: one quick retry hides a flaky request without keeping the user waiting on an
 *   outage.
 *
 * @returns A fresh client; {@link AppProviders} creates one per mount.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });
}
