import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';

interface TotalBarProps {
  total: number;
  openTotal: number;
  itemsWithoutPrice: number;
}

export function TotalBar({ total, openTotal, itemsWithoutPrice }: TotalBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line bg-paper-raised px-4 py-2.5">
      <div>
        <p className="font-display text-lg leading-tight text-ink">{formatCurrency(total)}</p>
        <p className="text-xs text-ink-muted">Noch offen: {formatCurrency(openTotal)}</p>
      </div>
      {itemsWithoutPrice > 0 && <Badge tone="warning">{itemsWithoutPrice} ohne Preis</Badge>}
    </div>
  );
}
