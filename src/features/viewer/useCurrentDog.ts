import type { Dog } from '@/domain/dog';
import { useSelection } from './SelectionContext';
import { useRandomDog } from './useRandomDogs';

interface CurrentDog {
  /** The dog shown as the main image: the user's pick, or the random dog until they pick one. */
  dog: Dog | null;
  /** True while the random dog is loading and nothing has been picked yet. */
  isPending: boolean;
  refetch: () => Promise<unknown>;
}

export function useCurrentDog(): CurrentDog {
  const { selectedDog } = useSelection();
  const { data, isPending, refetch } = useRandomDog();
  return { dog: selectedDog ?? data ?? null, isPending, refetch };
}
