import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Item } from '@/types/db';
import { ItemRow } from './ItemRow';

interface CategorySectionProps {
  title: string;
  emoji: string;
  items: Item[];
  onToggle: (item: Item) => void;
  onEdit: (item: Item) => void;
  onQuantityChange: (item: Item, nextQuantity: number) => void;
  defaultCollapsed?: boolean;
}

export function CategorySection({
  title,
  emoji,
  items,
  onToggle,
  onEdit,
  onQuantityChange,
  defaultCollapsed = false,
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  if (items.length === 0) return null;
  const openCount = items.filter((item) => !item.checked).length;

  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <ChevronDown
          size={18}
          className={`text-neutral-400 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`}
        />
        <span className="text-lg">{emoji}</span>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">{title}</span>
        <span className="ml-auto text-sm text-neutral-400">{openCount} offen</span>
      </button>
      {!collapsed && (
        <div>
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggle(item)}
              onEdit={() => onEdit(item)}
              onQuantityChange={(next) => onQuantityChange(item, next)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
