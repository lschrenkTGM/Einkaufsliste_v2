import { useMemo, useState } from 'react';
import { ArrowUp, Minus, Plus } from 'lucide-react';
import { parseQuickAdd } from '@/lib/quickAdd';
import { UNITS, stepFor } from '@/lib/constants';
import { formatQuantity } from '@/lib/format';
import type { Category, Item } from '@/types/db';
import type { NewItemInput } from '@/hooks/useItems';

interface QuickAddBarProps {
  items: Item[];
  categories: Category[];
  onAdd: (input: NewItemInput) => void;
}

export function QuickAddBar({ items, categories, onAdd }: QuickAddBarProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

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

  function reset() {
    setValue('');
    setQuantity(1);
    setUnit(null);
    setCategoryId(null);
    setTouched(false);
    setShowSuggestions(false);
  }

  function handleTextChange(text: string) {
    setValue(text);
    setShowSuggestions(true);
    if (touched) return;

    const parsed = parseQuickAdd(text);
    if (!parsed) return;
    const historical = historyByName.get(parsed.name.toLowerCase());
    setQuantity(parsed.quantity);
    setUnit(parsed.explicitUnit ? parsed.unit : historical?.unit ?? parsed.unit);
    setCategoryId(historical?.category_id ?? null);
  }

  function applySuggestion(item: Item) {
    setValue(item.name);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setCategoryId(item.category_id);
    setTouched(true);
    setShowSuggestions(false);
  }

  function submit() {
    const parsed = parseQuickAdd(value);
    if (!parsed) return;
    const historical = historyByName.get(parsed.name.toLowerCase());
    onAdd({
      name: parsed.name,
      quantity,
      unit,
      price: historical?.price ?? null,
      category_id: categoryId,
    });
    reset();
  }

  const step = stepFor(unit);
  const expanded = value.trim().length > 0;

  return (
    <div className="relative px-3 py-2.5">
      {showSuggestions && suggestions.length > 0 && (
        <div className="animate-rise-in absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-lifted">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applySuggestion(item)}
              className="block w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-paper-sunken"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {expanded && (
        <div className="animate-rise-in mb-2 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-line bg-paper-raised px-1 py-1">
            <button
              type="button"
              onClick={() => {
                setTouched(true);
                setQuantity((q) => Math.max(step, q - step));
              }}
              aria-label="Weniger"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-paper-sunken"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-[2.5rem] text-center text-sm font-medium text-ink">
              {formatQuantity(quantity)}
            </span>
            <button
              type="button"
              onClick={() => {
                setTouched(true);
                setQuantity((q) => q + step);
              }}
              aria-label="Mehr"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-paper-sunken"
            >
              <Plus size={14} />
            </button>
          </div>

          <select
            value={unit ?? ''}
            onChange={(event) => {
              setTouched(true);
              setUnit(event.target.value || null);
            }}
            className="h-9 flex-1 rounded-full border border-line bg-paper-raised px-3 text-sm text-ink focus:border-primary focus:outline-none"
          >
            <option value="">Einheit</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select
            value={categoryId ?? ''}
            onChange={(event) => {
              setTouched(true);
              setCategoryId(event.target.value || null);
            }}
            className="h-9 flex-1 rounded-full border border-line bg-paper-raised px-3 text-sm text-ink focus:border-primary focus:outline-none"
          >
            <option value="">Kategorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-2xl border border-line bg-paper-sunken pl-4 pr-1.5 transition-colors focus-within:border-primary focus-within:shadow-ring">
        <input
          value={value}
          onChange={(event) => handleTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Artikel hinzufügen, z.B. 2 kg Äpfel"
          className="min-h-[46px] flex-1 bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
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
