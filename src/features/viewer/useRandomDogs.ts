import { useQuery } from '@tanstack/react-query';
import { fetchRandomDog, fetchRandomDogs } from '@/api/dogApi';
import { dogKeys } from '@/api/queryKeys';

/** How many thumbnails "More dogs" shows. */
export const THUMBNAIL_COUNT = 10;

/**
 * The random dog shown as the main image until the user picks one.
 *
 * Fetched once and cached for the session (see {@link createQueryClient}); call `refetch()` for
 * a new one. Every component using this hook shares the same request and result.
 *
 * Usually read through {@link useCurrentDog}, which also accounts for the user's pick.
 *
 * @returns The TanStack Query result; `data` is the {@link Dog}.
 */
export function useRandomDog() {
  return useQuery({
    queryKey: dogKeys.randomOne(),
    queryFn: ({ signal }) => fetchRandomDog(signal),
  });
}

/**
 * A set of random dogs for the thumbnails.
 *
 * Fetched once and cached for the session; `refetch()` loads a new set while keeping the old one
 * in `data` until it arrives (`isFetching` is true meanwhile).
 *
 * @param count - How many dogs, 1 to 50. Each count is cached separately.
 * @returns The TanStack Query result; `data` is the {@link Dog} array.
 */
export function useRandomDogs(count: number = THUMBNAIL_COUNT) {
  return useQuery({
    queryKey: dogKeys.randomMany(count),
    queryFn: ({ signal }) => fetchRandomDogs(count, signal),
  });
}
