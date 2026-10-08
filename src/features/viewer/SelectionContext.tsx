import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Dog } from '@/domain/dog';

interface SelectionContextValue {
  /** The dog the user picked explicitly, or `null` to fall back to the random main dog. */
  selectedDog: Dog | null;
  selectDog: (dog: Dog) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const value = useMemo(() => ({ selectedDog, selectDog: setSelectedDog }), [selectedDog]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);
  if (!context) throw new Error('useSelection must be used within a SelectionProvider');
  return context;
}
