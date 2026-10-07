import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/db';

function categoriesQueryKey(listId: string | undefined) {
  return ['categories', listId] as const;
}

export function useCategories(listId: string | undefined) {
  return useQuery({
    queryKey: categoriesQueryKey(listId),
    enabled: !!listId,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('list_id', listId!)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCategoryMutations(listId: string | undefined) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey(listId) });

  const addCategory = useMutation({
    mutationFn: async ({ name, emoji, sortOrder }: { name: string; emoji: string; sortOrder: number }) => {
      if (!listId) throw new Error('Keine Liste ausgewählt');
      const { error } = await supabase
        .from('categories')
        .insert({ list_id: listId, name, emoji, sort_order: sortOrder });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...fields }: { id: string; name?: string; emoji?: string; sort_order?: number }) => {
      const { error } = await supabase.from('categories').update(fields).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { addCategory, updateCategory, deleteCategory };
}
