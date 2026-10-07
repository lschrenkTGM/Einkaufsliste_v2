import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ListRole, Profile } from '@/types/db';

export interface MemberSummary {
  userId: string;
  role: ListRole;
  profile: Profile | null;
}

function membersQueryKey(listId: string | undefined) {
  return ['members', listId] as const;
}

export function useMembers(listId: string | undefined) {
  return useQuery({
    queryKey: membersQueryKey(listId),
    enabled: !!listId,
    queryFn: async (): Promise<MemberSummary[]> => {
      const { data: memberRows, error: memberError } = await supabase
        .from('list_members')
        .select('user_id, role')
        .eq('list_id', listId!);
      if (memberError) throw memberError;
      if (!memberRows || memberRows.length === 0) return [];

      const userIds = memberRows.map((row) => row.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (profileError) throw profileError;

      const profileById = new Map(profiles?.map((profile) => [profile.id, profile]));
      return memberRows.map((row) => ({
        userId: row.user_id,
        role: row.role,
        profile: profileById.get(row.user_id) ?? null,
      }));
    },
  });
}

export function useRemoveMember(listId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!listId) throw new Error('Keine Liste ausgewählt');
      const { error } = await supabase
        .from('list_members')
        .delete()
        .eq('list_id', listId)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey(listId) });
    },
  });
}
