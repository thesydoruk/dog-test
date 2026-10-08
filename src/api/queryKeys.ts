export const dogKeys = {
  all: ['dogs'] as const,
  randomOne: () => [...dogKeys.all, 'random', 'one'] as const,
  randomMany: (count: number) => [...dogKeys.all, 'random', 'many', count] as const,
};
