import { useState } from 'react';
import { Plus, ShoppingCart, UserPlus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/ToastContext';
import { ListCard } from '@/components/lists/ListCard';
import { ListForm } from '@/components/lists/ListForm';
import { JoinDialog } from '@/components/lists/JoinDialog';
import { useLists, useListMutations, type ListSummary } from '@/hooks/useLists';
import { useNavigate } from 'react-router-dom';

export default function ListsPage() {
  const { data: lists, isLoading } = useLists();
  const { createList, renameList, deleteList, leaveList } = useListMutations();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [actionList, setActionList] = useState<ListSummary | null>(null);
  const [renameList_, setRenameList_] = useState<ListSummary | null>(null);

  async function handleCreate(values: { name: string; emoji: string }) {
    try {
      const created = await createList.mutateAsync(values);
      setCreateOpen(false);
      navigate(`/list/${created.id}`);
    } catch (error) {
      console.error(error);
      showToast({ message: 'Liste konnte nicht erstellt werden', tone: 'error' });
    }
  }

  async function handleRename(values: { name: string; emoji: string }) {
    if (!renameList_) return;
    try {
      await renameList.mutateAsync({ id: renameList_.id, ...values });
      setRenameList_(null);
      showToast({ message: 'Liste umbenannt', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Umbenennen fehlgeschlagen', tone: 'error' });
    }
  }

  async function handleDelete(list: ListSummary) {
    if (!window.confirm(`"${list.name}" wirklich löschen?`)) return;
    try {
      await deleteList.mutateAsync(list.id);
      setActionList(null);
      showToast({ message: 'Liste gelöscht', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Löschen fehlgeschlagen', tone: 'error' });
    }
  }

  async function handleLeave(list: ListSummary) {
    try {
      await leaveList.mutateAsync(list.id);
      setActionList(null);
      showToast({ message: 'Liste verlassen', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Verlassen fehlgeschlagen', tone: 'error' });
    }
  }

  return (
    <AppShell>
      <Header title="Meine Listen" />

      {isLoading && (
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!isLoading && lists?.length === 0 && (
        <EmptyState
          icon={<ShoppingCart size={40} />}
          title="Noch keine Liste vorhanden"
          description="Leg deine erste Einkaufsliste an oder tritt einer bestehenden Liste per Code bei."
          action={
            <div className="flex gap-2">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus size={18} /> Neue Liste
              </Button>
              <Button variant="secondary" onClick={() => setJoinOpen(true)}>
                <UserPlus size={18} /> Beitreten
              </Button>
            </div>
          }
        />
      )}

      {lists && lists.length > 0 && (
        <div className="flex flex-col gap-3 p-4">
          {lists.map((list, index) => (
            <div key={list.id} className="stagger-item" style={{ animationDelay: `${index * 40}ms` }}>
              <ListCard list={list} onMenu={setActionList} />
            </div>
          ))}
        </div>
      )}

      {lists && lists.length > 0 && (
        <div className="safe-bottom sticky bottom-16 flex justify-end gap-2 p-4">
          <Button variant="secondary" onClick={() => setJoinOpen(true)}>
            <UserPlus size={18} />
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={18} /> Neue Liste
          </Button>
        </div>
      )}

      <Sheet open={createOpen} onClose={() => setCreateOpen(false)} title="Neue Liste">
        <ListForm submitLabel="Erstellen" submitting={createList.isPending} onSubmit={handleCreate} />
      </Sheet>

      <Sheet open={!!renameList_} onClose={() => setRenameList_(null)} title="Liste umbenennen">
        {renameList_ && (
          <ListForm
            initialName={renameList_.name}
            initialEmoji={renameList_.emoji}
            submitLabel="Speichern"
            submitting={renameList.isPending}
            onSubmit={handleRename}
          />
        )}
      </Sheet>

      <JoinDialog open={joinOpen} onClose={() => setJoinOpen(false)} />

      <Sheet open={!!actionList} onClose={() => setActionList(null)} title={actionList?.name}>
        {actionList && (
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRenameList_(actionList);
                setActionList(null);
              }}
            >
              Umbenennen
            </Button>
            {actionList.role === 'owner' ? (
              <Button variant="danger" onClick={() => handleDelete(actionList)}>
                Löschen
              </Button>
            ) : (
              <Button variant="danger" onClick={() => handleLeave(actionList)}>
                Verlassen
              </Button>
            )}
          </div>
        )}
      </Sheet>
    </AppShell>
  );
}
