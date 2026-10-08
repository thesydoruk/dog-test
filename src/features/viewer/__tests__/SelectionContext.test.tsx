import { act, renderHook } from '@testing-library/react';
import { mainDog } from '@/test/fixtures';
import { SelectionProvider, useSelection } from '../SelectionContext';

describe('SelectionContext', () => {
  it('starts with nothing selected and stores the selection', () => {
    const { result } = renderHook(() => useSelection(), { wrapper: SelectionProvider });

    expect(result.current.selectedDog).toBeNull();
    act(() => result.current.selectDog(mainDog));
    expect(result.current.selectedDog).toBe(mainDog);
  });

  it('throws outside of the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSelection())).toThrow(/within a SelectionProvider/);
  });
});
