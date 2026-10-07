import { Copy, RefreshCw, Share2, UserX } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import { useMembers, useRemoveMember } from '@/hooks/useMembers';
import { useAuth } from '@/hooks/useAuth';
import { useListMutations } from '@/hooks/useLists';
import type { ShoppingList } from '@/types/db';

interface ShareDialogProps {
  list: ShoppingList;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ list, open, onClose }: ShareDialogProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { data: members = [] } = useMembers(list.id);
  const removeMember = useRemoveMember(list.id);
  const { regenerateInviteCode } = useListMutations();

  const isOwner = list.owner_id === profile?.id;
  const joinUrl = `${window.location.origin}/join/${list.invite_code}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      showToast({ message: 'Link kopiert', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Kopieren fehlgeschlagen', tone: 'error' });
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: list.name, url: joinUrl });
      } catch (error) {
        console.error(error);
      }
    } else {
      await copyLink();
    }
  }

  async function regenerate() {
    if (!window.confirm('Neuen Code generieren? Der alte Code wird ungültig.')) return;
    try {
      await regenerateInviteCode.mutateAsync(list.id);
      showToast({ message: 'Neuer Code erstellt', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Code konnte nicht erneuert werden', tone: 'error' });
    }
  }

  async function removeMemberFromList(userId: string) {
    if (!window.confirm('Mitglied aus der Liste entfernen?')) return;
    try {
      await removeMember.mutateAsync(userId);
      showToast({ message: 'Mitglied entfernt', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Entfernen fehlgeschlagen', tone: 'error' });
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Liste teilen">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 rounded-xl bg-neutral-100 p-4 text-center dark:bg-neutral-800">
          <p className="text-2xl font-bold tracking-widest text-neutral-900 dark:text-neutral-100">
            {list.invite_code}
          </p>
          <p className="break-all text-sm text-neutral-500 dark:text-neutral-400">{joinUrl}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={copyLink} className="flex-1">
            <Copy size={16} /> Link kopieren
          </Button>
          <Button variant="secondary" onClick={share} className="flex-1">
            <Share2 size={16} /> Teilen
          </Button>
        </div>

        {isOwner && (
          <Button variant="secondary" onClick={regenerate} disabled={regenerateInviteCode.isPending}>
            <RefreshCw size={16} /> Code neu generieren
          </Button>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Mitglieder</p>
          <div className="flex flex-col gap-1">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <span className="flex-1 truncate text-sm text-neutral-900 dark:text-neutral-100">
                  {member.profile?.display_name || member.profile?.username || 'Unbekannt'}
                  {member.role === 'owner' && ' (Owner)'}
                </span>
                {isOwner && member.userId !== profile?.id && (
                  <button
                    onClick={() => removeMemberFromList(member.userId)}
                    aria-label="Entfernen"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <UserX size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
