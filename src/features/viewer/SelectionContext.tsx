import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Dog } from '@/domain/dog';

/** What {@link useSelection} returns. */
interface SelectionContextValue {
  /** The dog the user picked explicitly, or `null` to fall back to the random main dog. */
  selectedDog: Dog | null;
  /** Shows a dog as the main image. Stable between renders. */
  selectDog: (dog: Dog) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

/** Props for {@link SelectionProvider}. */
interface SelectionProviderProps {
  /** Components that read or change which dog is shown as the main image. */
  children: ReactNode;
}

/**
 * Holds the dog the user picked as the main image (from a thumbnail or a favorite).
 *
 * Only the explicit pick is stored; until there is one, {@link useCurrentDog} falls back to the
 * random dog. The selection is not persisted and resets on reload.
 */
export function SelectionProvider({ children }: SelectionProviderProps) {
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const value = useMemo(() => ({ selectedDog, selectDog: setSelectedDog }), [selectedDog]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

/**
 * Reads and changes the user's pick for the main image.
 *
 * Prefer {@link useCurrentDog} to read what is actually shown; use this hook for `selectDog`.
 *
 * @throws `Error` when called outside a {@link SelectionProvider}.
 */
export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);
  if (!context) throw new Error('useSelection must be used within a SelectionProvider');
  return context;
}
