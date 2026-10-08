import { useSelection } from './SelectionContext';
import { useRandomDog } from './useRandomDogs';

/** The dog shown as the main image: the user's pick, or the random dog until they pick one. */
export function useCurrentDog() {
  const { selectedDog } = useSelection();
  const randomDog = useRandomDog();
  return { ...randomDog, dog: selectedDog ?? randomDog.data ?? null };
}
