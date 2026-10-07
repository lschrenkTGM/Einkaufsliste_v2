import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { ListRole, ShoppingList } from '@/types/db';

export interface ListSummary extends ShoppingList {
  role: ListRole;
  memberCount: number;
  itemsTotal: number;
  itemsChecked: number;
}

function listsQueryKey(userId: string | undefined) {
  return ['lists', userId] as const;
}

export function useLists() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: listsQueryKey(profile?.id),
    enabled: !!profile,
    queryFn: async (): Promise<ListSummary[]> => {
      const { data: memberships, error: membershipError } = await supabase
        .from('list_members')
        .select('list_id, role')
        .eq('user_id', profile!.id);
      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) return [];

      const listIds = memberships.map((m) => m.list_id);
      const roleByListId = new Map(memberships.map((m) => [m.list_id, m.role]));

      const [listsResult, membersResult, itemsResult] = await Promise.all([
        supabase.from('lists').select('*').in('id', listIds),
        supabase.from('list_members').select('list_id').in('list_id', listIds),
        supabase.from('items').select('list_id, checked').in('list_id', listIds),
      ]);
      if (listsResult.error) throw listsResult.error;
      if (membersResult.error) throw membersResult.error;
      if (itemsResult.error) throw itemsResult.error;

      return (listsResult.data ?? [])
        .map((list) => {
          const memberCount = membersResult.data?.filter((m) => m.list_id === list.id).length ?? 0;
          const listItems = itemsResult.data?.filter((i) => i.list_id === list.id) ?? [];
          return {
            ...list,
            role: roleByListId.get(list.id) ?? 'member',
            memberCount,
            itemsTotal: listItems.length,
            itemsChecked: listItems.filter((i) => i.checked).length,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'de-AT'));
    },
  });
}

export function useList(listId: string | undefined) {
  return useQuery({
    queryKey: ['list', listId],
    enabled: !!listId,
    queryFn: async (): Promise<ShoppingList> => {
      const { data, error } = await supabase.from('lists').select('*').eq('id', listId!).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useListMutations() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const invalidateLists = () => queryClient.invalidateQueries({ queryKey: listsQueryKey(profile?.id) });

  const createList = useMutation({
    mutationFn: async ({ name, emoji }: { name: string; emoji: string }) => {
      if (!profile) throw new Error('Nicht eingeloggt');
      const { data, error } = await supabase
        .from('lists')
        .insert({ name, emoji, owner_id: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidateLists,
  });

  const renameList = useMutation({
    mutationFn: async ({ id, name, emoji }: { id: string; name: string; emoji: string }) => {
      const { error } = await supabase.from('lists').update({ name, emoji }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: ['list', variables.id] });
    },
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidateLists,
  });

  const leaveList = useMutation({
    mutationFn: async (id: string) => {
      if (!profile) throw new Error('Nicht eingeloggt');
      const { error } = await supabase
        .from('list_members')
        .delete()
        .eq('list_id', id)
        .eq('user_id', profile.id);
      if (error) throw error;
    },
    onSuccess: invalidateLists,
  });

  const regenerateInviteCode = useMutation({
    mutationFn: async (listId: string) => {
      if (!profile) throw new Error('Nicht eingeloggt');
      const { data, error } = await supabase.rpc('regenerate_invite_code', {
        _list_id: listId,
        _user_id: profile.id,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, listId) => {
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: ['list', listId] });
    },
  });

  return { createList, renameList, deleteList, leaveList, regenerateInviteCode };
}
