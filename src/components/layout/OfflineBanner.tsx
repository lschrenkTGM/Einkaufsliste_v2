import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePendingMutationsCount } from '@/hooks/usePendingMutationsCount';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const pendingCount = usePendingMutationsCount();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
      <WifiOff size={16} className="shrink-0" />
      <span className="flex-1">
        {isOnline
          ? 'Synchronisiere ausstehende Änderungen …'
          : 'Offline – Änderungen werden synchronisiert, sobald du wieder online bist.'}
      </span>
      {pendingCount > 0 && (
        <span className="shrink-0 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold dark:bg-amber-800">
          {pendingCount} ausstehend
        </span>
      )}
    </div>
  );
}
