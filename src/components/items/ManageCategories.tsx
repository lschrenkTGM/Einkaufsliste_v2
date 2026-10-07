import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LIST_EMOJIS } from '@/lib/constants';
import type { Category } from '@/types/db';

interface ManageCategoriesProps {
  categories: Category[];
  onAdd: (name: string, emoji: string) => void;
  onMove: (category: Category, direction: 'up' | 'down') => void;
  onDelete: (category: Category) => void;
}

export function ManageCategories({ categories, onAdd, onMove, onDelete }: ManageCategoriesProps) {
  const [name, setName] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, LIST_EMOJIS[0]);
    setName('');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="flex items-center gap-2 rounded-xl border border-line px-3 py-2"
          >
            <span className="text-lg">{category.emoji}</span>
            <span className="flex-1 truncate text-sm text-ink">
              {category.name}
            </span>
            <button
              disabled={index === 0}
              onClick={() => onMove(category, 'up')}
              aria-label="Nach oben"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-paper-sunken disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
            <button
              disabled={index === categories.length - 1}
              onClick={() => onMove(category, 'down')}
              aria-label="Nach unten"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-paper-sunken disabled:opacity-30"
            >
              <ArrowDown size={16} />
            </button>
            <button
              onClick={() => onDelete(category)}
              aria-label="Löschen"
              className="flex h-9 w-9 items-center justify-center rounded-full text-danger hover:bg-danger-soft"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Input
          label="Neue Kategorie"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="flex-1"
        />
        <Button type="submit">Hinzufügen</Button>
      </form>
    </div>
  );
}
