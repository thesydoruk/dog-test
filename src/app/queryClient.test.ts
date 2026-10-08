import { createQueryClient } from './queryClient';

describe('createQueryClient', () => {
  it('never refetches random dogs in the background', () => {
    const queries = createQueryClient().getDefaultOptions().queries;

    expect(queries).toMatchObject({
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    });
  });

  it('creates independent clients', () => {
    expect(createQueryClient()).not.toBe(createQueryClient());
  });
});
