import { useParams } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { Link2 } from 'lucide-react';

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <EmptyState icon={<Link2 size={40} />} title={`Einladung ${code} – kommt in Phase 4`} />
    </div>
  );
}
