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
  onDelete: (item: Item) => void;
  defaultCollapsed?: boolean;
  memberNames?: Map<string, string>;
}

export function CategorySection({
  title,
  emoji,
  items,
  onToggle,
  onEdit,
  onQuantityChange,
  onDelete,
  defaultCollapsed = false,
  memberNames,
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  if (items.length === 0) return null;
  const openCount = items.filter((item) => !item.checked).length;

  return (
    <div className="border-b border-line/70">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left"
      >
        <ChevronDown
          size={16}
          className={`text-ink-faint transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        />
        <span className="text-lg">{emoji}</span>
        <span className="font-display text-base text-ink">{title}</span>
        <span className="ml-auto text-xs font-medium text-ink-faint">{openCount} offen</span>
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
              onDelete={() => onDelete(item)}
              checkedByName={item.checked_by ? memberNames?.get(item.checked_by) : undefined}
              createdByName={memberNames?.get(item.created_by)}
              updatedByName={item.updated_by ? memberNames?.get(item.updated_by) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
