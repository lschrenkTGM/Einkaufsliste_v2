import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function usePendingMutationsCount(): number {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const cache = queryClient.getMutationCache();

    function update() {
      const pending = cache.getAll().filter((m) => m.state.isPaused);
      setCount(pending.length);
    }

    update();
    const unsubscribe = cache.subscribe(update);
    return unsubscribe;
  }, [queryClient]);

  return count;
}
