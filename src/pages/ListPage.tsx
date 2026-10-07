import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListChecks } from 'lucide-react';

export default function ListPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AppShell showBottomNav={false}>
      <Header title="Liste" showBack />
      <EmptyState icon={<ListChecks size={40} />} title={`Liste ${id} – kommt in Phase 3`} />
    </AppShell>
  );
}
