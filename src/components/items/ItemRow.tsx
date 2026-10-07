import { useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import type { Item } from '@/types/db';
import { formatCurrency, formatQuantity } from '@/lib/format';

interface ItemRowProps {
  item: Item;
  onToggle: () => void;
  onEdit: () => void;
  onQuantityChange: (nextQuantity: number) => void;
  onDelete: () => void;
  checkedByName?: string | null;
}

function stepFor(unit: string | null): number {
  if (unit === 'kg' || unit === 'l') return 0.5;
  if (unit === 'g' || unit === 'ml') return 50;
  return 1;
}

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
}

export function ItemRow({
  item,
  onToggle,
  onEdit,
  onQuantityChange,
  onDelete,
  checkedByName,
}: ItemRowProps) {
  const step = stepFor(item.unit);
  const lineTotal = item.price != null ? item.price * item.quantity : null;
  const rowRef = useRef<HTMLDivElement>(null);

  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir] }) => {
      if (down) {
        api.start({ x: mx, immediate: true });
        return;
      }

      const width = rowRef.current?.offsetWidth ?? 320;
      const threshold = width * 0.35;

      if (Math.abs(mx) < threshold) {
        api.start({ x: 0, immediate: false });
        return;
      }

      if (xDir > 0) {
        vibrate();
        api.start({ x: 0, immediate: false });
        onToggle();
      } else {
        vibrate();
        api.start({
          x: -width,
          immediate: false,
          onRest: () => {
            onDelete();
            api.set({ x: 0 });
          },
        });
      }
    },
    { axis: 'x', filterTaps: true, pointer: { touch: true } },
  );

  return (
    <div ref={rowRef} className="relative overflow-hidden border-b border-neutral-100 last:border-b-0 dark:border-neutral-800">
      <div className="absolute inset-0 flex items-stretch justify-between">
        <div className="flex items-center gap-2 bg-primary-600 px-4 text-white">
          <Check size={20} />
        </div>
        <div className="flex items-center gap-2 bg-red-600 px-4 text-white">
          <Trash2 size={20} />
        </div>
      </div>

      <animated.div
        {...bind()}
        style={{ x, touchAction: 'pan-y' }}
        className={`relative flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950 ${
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
      </animated.div>
    </div>
  );
}
