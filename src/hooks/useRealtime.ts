import { useEffect } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface RowWithId {
  id: string;
  updated_at?: string;
}

function applyChange<T extends RowWithId>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
) {
  queryClient.setQueryData<T[]>(queryKey, (current) => {
    if (!current) return current;

    if (payload.eventType === 'DELETE') {
      const oldId = (payload.old as Partial<RowWithId>).id;
      if (!oldId) return current;
      return current.filter((row) => row.id !== oldId);
    }

    const newRow = payload.new as T;
    const existingIndex = current.findIndex((row) => row.id === newRow.id);
    if (existingIndex === -1) {
      return [...current, newRow];
    }

    const existing = current[existingIndex];
    if (existing.updated_at && newRow.updated_at && existing.updated_at >= newRow.updated_at) {
      return current;
    }

    const next = [...current];
    next[existingIndex] = newRow;
    return next;
  });
}

export function useRealtime(listId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listId) return;

    const channel = supabase
      .channel(`list-${listId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
        (payload) => applyChange(queryClient, ['items', listId], payload),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories', filter: `list_id=eq.${listId}` },
        (payload) => applyChange(queryClient, ['categories', listId], payload),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'list_members', filter: `list_id=eq.${listId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['members', listId] });
        },
      )
      .subscribe();

    function refetch() {
      queryClient.invalidateQueries({ queryKey: ['items', listId] });
      queryClient.invalidateQueries({ queryKey: ['categories', listId] });
      queryClient.invalidateQueries({ queryKey: ['members', listId] });
    }

    window.addEventListener('online', refetch);
    window.addEventListener('focus', refetch);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', refetch);
      window.removeEventListener('focus', refetch);
    };
  }, [listId, queryClient]);
}
