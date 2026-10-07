import { useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import type { Item } from '@/types/db';
import { formatCurrency, formatQuantity } from '@/lib/format';
import { stepFor } from '@/lib/constants';

interface ItemRowProps {
  item: Item;
  onToggle: () => void;
  onEdit: () => void;
  onQuantityChange: (nextQuantity: number) => void;
  onDelete: () => void;
  checkedByName?: string | null;
  createdByName?: string | null;
  updatedByName?: string | null;
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
  createdByName,
  updatedByName,
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
    <div ref={rowRef} className="relative overflow-hidden border-b border-line/70 last:border-b-0">
      <div className="absolute inset-0 flex items-stretch justify-between">
        <div className="flex items-center gap-2 bg-primary px-4 text-primary-ink">
          <Check size={20} />
        </div>
        <div className="flex items-center gap-2 bg-danger px-4 text-primary-ink">
          <Trash2 size={20} />
        </div>
      </div>

      <animated.div
        {...bind()}
        style={{ x, touchAction: 'pan-y' }}
        className={`relative flex items-center gap-3 bg-paper px-4 py-3.5 transition-opacity ${
          item.checked ? 'opacity-45' : ''
        }`}
      >
        <button
          onClick={onToggle}
          aria-label={item.checked ? 'Zurücknehmen' : 'Abhaken'}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
            item.checked
              ? 'border-primary bg-primary text-primary-ink'
              : 'border-ink-faint text-transparent hover:border-primary'
          }`}
        >
          <Check size={16} />
        </button>

        <button onClick={onEdit} className="min-w-0 flex-1 text-left">
          <p className={`truncate text-base text-ink ${item.checked ? 'line-through' : ''}`}>{item.name}</p>
          <p className="truncate text-sm text-ink-muted">
            {formatQuantity(item.quantity)} {item.unit ?? ''}
            {lineTotal != null && ` · ${formatCurrency(lineTotal)}`}
          </p>
          {item.checked && checkedByName && (
            <p className="truncate text-xs text-ink-faint">Abgehakt von {checkedByName}</p>
          )}
          {!item.checked && (createdByName || updatedByName) && (
            <p className="truncate text-xs text-ink-faint">
              {createdByName && `von ${createdByName}`}
              {updatedByName && updatedByName !== createdByName && ` · bearbeitet von ${updatedByName}`}
            </p>
          )}
        </button>

        {!item.checked && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onQuantityChange(Math.max(step, item.quantity - step))}
              aria-label="Weniger"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => onQuantityChange(item.quantity + step)}
              aria-label="Mehr"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </animated.div>
    </div>
  );
}
