import { Plus, ShoppingCart } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function ListsPage() {
  return (
    <AppShell>
      <Header title="Meine Listen" />
      <EmptyState
        icon={<ShoppingCart size={40} />}
        title="Noch keine Liste vorhanden"
        description="Leg deine erste Einkaufsliste an oder tritt einer bestehenden Liste per Code bei."
        action={
          <Button>
            <Plus size={18} /> Neue Liste
          </Button>
        }
      />
    </AppShell>
  );
}
