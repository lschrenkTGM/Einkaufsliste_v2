import { Check, Minus, Plus } from 'lucide-react';
import type { Item } from '@/types/db';
import { formatCurrency, formatQuantity } from '@/lib/format';

interface ItemRowProps {
  item: Item;
  onToggle: () => void;
  onEdit: () => void;
  onQuantityChange: (nextQuantity: number) => void;
  checkedByName?: string | null;
}

function stepFor(unit: string | null): number {
  if (unit === 'kg' || unit === 'l') return 0.5;
  if (unit === 'g' || unit === 'ml') return 50;
  return 1;
}

export function ItemRow({ item, onToggle, onEdit, onQuantityChange, checkedByName }: ItemRowProps) {
  const step = stepFor(item.unit);
  const lineTotal = item.price != null ? item.price * item.quantity : null;

  return (
    <div
      className={`flex items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0 dark:border-neutral-800 ${
        item.checked ? 'opacity-50' : ''
      }`}
    >
      <button
        onClick={onToggle}
        aria-label={item.checked ? 'Zurücknehmen' : 'Abhaken'}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
          item.checked
            ? 'border-primary-600 bg-primary-600 text-white'
            : 'border-neutral-300 text-transparent dark:border-neutral-600'
        }`}
      >
        <Check size={16} />
      </button>

      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p
          className={`truncate text-base text-neutral-900 dark:text-neutral-100 ${
            item.checked ? 'line-through' : ''
          }`}
        >
          {item.name}
        </p>
        <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
          {formatQuantity(item.quantity)} {item.unit ?? ''}
          {lineTotal != null && ` · ${formatCurrency(lineTotal)}`}
        </p>
        {item.checked && checkedByName && (
          <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">
            Zuletzt abgehakt von {checkedByName}
          </p>
        )}
      </button>

      {!item.checked && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQuantityChange(Math.max(step, item.quantity - step))}
            aria-label="Weniger"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => onQuantityChange(item.quantity + step)}
            aria-label="Mehr"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
