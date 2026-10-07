import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';

const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: SEVEN_DAYS_MS,
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 1,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key: string) => get(key),
    setItem: (key: string, value: string) => set(key, value),
    removeItem: (key: string) => del(key),
  },
  key: 'einkaufsliste-query-cache',
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: SEVEN_DAYS_MS,
  dehydrateOptions: {
    shouldDehydrateMutation: () => true,
  },
});

if (typeof window !== 'undefined') {
  if (navigator.onLine) {
    queryClient.resumePausedMutations();
  }
  window.addEventListener('online', () => {
    queryClient.resumePausedMutations().then(() => {
      queryClient.invalidateQueries();
    });
  });
}
