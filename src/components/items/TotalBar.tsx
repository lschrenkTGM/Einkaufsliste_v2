import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';

interface TotalBarProps {
  total: number;
  openTotal: number;
  itemsWithoutPrice: number;
}

export function TotalBar({ total, openTotal, itemsWithoutPrice }: TotalBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-neutral-950">
      <div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Gesamt: {formatCurrency(total)}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Noch offen: {formatCurrency(openTotal)}
        </p>
      </div>
      {itemsWithoutPrice > 0 && <Badge tone="warning">{itemsWithoutPrice} ohne Preis</Badge>}
    </div>
  );
}
