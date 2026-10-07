import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Item } from '@/types/db';

function itemsQueryKey(listId: string | undefined) {
  return ['items', listId] as const;
}

export function useItems(listId: string | undefined) {
  return useQuery({
    queryKey: itemsQueryKey(listId),
    enabled: !!listId,
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('list_id', listId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export interface NewItemInput {
  id?: string;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  category_id: string | null;
}

export function useItemMutations(listId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: itemsQueryKey(listId) });

  const addItem = useMutation({
    mutationFn: async (input: NewItemInput) => {
      if (!listId) throw new Error('Keine Liste ausgewählt');
      const { error } = await supabase.from('items').insert({
        id: input.id ?? crypto.randomUUID(),
        list_id: listId,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        price: input.price,
        category_id: input.category_id,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string;
      name?: string;
      quantity?: number;
      unit?: string | null;
      price?: number | null;
      category_id?: string | null;
    }) => {
      const { error } = await supabase.from('items').update(fields).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleChecked = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase
        .from('items')
        .update({
          checked,
          checked_by: checked ? user?.id ?? null : null,
          checked_at: checked ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteChecked = useMutation({
    mutationFn: async () => {
      if (!listId) throw new Error('Keine Liste ausgewählt');
      const { error } = await supabase.from('items').delete().eq('list_id', listId).eq('checked', true);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const resetAllChecked = useMutation({
    mutationFn: async () => {
      if (!listId) throw new Error('Keine Liste ausgewählt');
      const { error } = await supabase
        .from('items')
        .update({ checked: false, checked_by: null, checked_at: null })
        .eq('list_id', listId)
        .eq('checked', true);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { addItem, updateItem, toggleChecked, deleteItem, deleteChecked, resetAllChecked };
}
