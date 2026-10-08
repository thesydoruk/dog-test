import type { Dog } from '@/domain/dog';
import { useSelection } from './SelectionContext';
import { useRandomDog } from './useRandomDogs';

/** What {@link useCurrentDog} returns. */
interface CurrentDog {
  /** The dog shown as the main image: the user's pick, or the random dog until they pick one. */
  dog: Dog | null;
  /** True while the random dog is loading and nothing has been picked yet. */
  isPending: boolean;
  /** Reloads the random dog, e.g. from a "Try again" button. Doesn't clear the user's pick. */
  refetch: () => Promise<unknown>;
}

/**
 * The dog shown as the main image, combining the user's pick with the random dog.
 *
 * `dog` is `null` only while the random dog is loading or after it failed, and only if the user
 * hasn't picked anything. A pick always wins, so the page stays usable when the random endpoint
 * is down.
 *
 * Must be used inside {@link SelectionProvider} and a TanStack `QueryClientProvider`.
 *
 * @example
 * ```tsx
 * const { dog } = useCurrentDog();
 * const isShown = dog?.id === thumbnail.id;
 * ```
 */
export function useCurrentDog(): CurrentDog {
  const { selectedDog } = useSelection();
  const { data, isPending, refetch } = useRandomDog();
  return { dog: selectedDog ?? data ?? null, isPending, refetch };
}
