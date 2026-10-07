import { useMemo, useState } from 'react';
import { ArrowUp } from 'lucide-react';
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
    <div className="relative px-3 py-2.5">
      {showSuggestions && suggestions.length > 0 && (
        <div className="animate-rise-in absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-lifted">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => submit(item.name)}
              className="block w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-paper-sunken"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-paper-sunken pl-4 pr-1.5 transition-colors focus-within:border-primary focus-within:shadow-ring">
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
          className="min-h-[46px] flex-1 bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="button"
          onClick={() => submit(value)}
          disabled={!value.trim()}
          aria-label="Hinzufügen"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-ink transition-all duration-150 disabled:scale-90 disabled:opacity-0"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
