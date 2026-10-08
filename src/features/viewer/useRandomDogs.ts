import { useQuery } from '@tanstack/react-query';
import { fetchRandomDog, fetchRandomDogs } from '@/api/dogApi';
import { dogKeys } from '@/api/queryKeys';

export const THUMBNAIL_COUNT = 10;

export function useRandomDog() {
  return useQuery({
    queryKey: dogKeys.randomOne(),
    queryFn: ({ signal }) => fetchRandomDog(signal),
  });
}

export function useRandomDogs(count: number = THUMBNAIL_COUNT) {
  return useQuery({
    queryKey: dogKeys.randomMany(count),
    queryFn: ({ signal }) => fetchRandomDogs(count, signal),
  });
}
