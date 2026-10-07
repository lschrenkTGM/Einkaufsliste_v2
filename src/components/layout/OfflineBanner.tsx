import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePendingMutationsCount } from '@/hooks/usePendingMutationsCount';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const pendingCount = usePendingMutationsCount();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-accent-soft px-4 py-2 text-sm text-accent-strong">
      <WifiOff size={16} className="shrink-0" />
      <span className="flex-1">
        {isOnline
          ? 'Synchronisiere ausstehende Änderungen …'
          : 'Offline – Änderungen werden synchronisiert, sobald du wieder online bist.'}
      </span>
      {pendingCount > 0 && (
        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary-ink">
          {pendingCount} ausstehend
        </span>
      )}
    </div>
  );
}
