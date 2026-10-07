import { useMemo, useState } from 'react';
import { parseQuickAdd } from '@/lib/quickAdd';
import type { Item } from '@/types/db';
import type { NewItemInput } from '@/hooks/useItems';

interface QuickAddBarProps {
  items: Item[];
  onAdd: (input: NewItemInput) => void;
}

export function QuickAddBar({ items, onAdd }: QuickAddBarProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const historyByName = useMemo(() => {
    const map = new Map<string, Item>();
    for (const item of items) {
      const key = item.name.toLowerCase();
      const existing = map.get(key);
      if (!existing || item.created_at > existing.created_at) map.set(key, item);
    }
    return map;
  }, [items]);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (query.length < 2) return [];
    return [...historyByName.values()]
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [value, historyByName]);

  function submit(rawValue: string) {
    const parsed = parseQuickAdd(rawValue);
    if (!parsed) return;
    const historical = historyByName.get(parsed.name.toLowerCase());
    onAdd({
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.explicitUnit ? parsed.unit : historical?.unit ?? parsed.unit,
      price: historical?.price ?? null,
      category_id: historical?.category_id ?? null,
    });
    setValue('');
    setShowSuggestions(false);
  }

  return (
    <div className="relative px-4 py-2">
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => submit(item.name)}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      <input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit(value);
          }
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Artikel hinzufügen, z.B. 2 kg Äpfel"
        className="min-h-[44px] w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </div>
  );
}
