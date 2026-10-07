import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UNITS } from '@/lib/constants';
import type { Category, Item } from '@/types/db';

interface ItemFormProps {
  item: Item;
  categories: Category[];
  onSave: (fields: {
    name: string;
    quantity: number;
    unit: string | null;
    price: number | null;
    category_id: string | null;
  }) => void;
  onDelete: () => void;
  submitting?: boolean;
}

export function ItemForm({ item, categories, onSave, onDelete, submitting }: ItemFormProps) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit ?? '');
  const [price, setPrice] = useState(item.price != null ? String(item.price) : '');
  const [categoryId, setCategoryId] = useState(item.category_id ?? '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedQuantity = Number(quantity.replace(',', '.'));
    if (!name.trim() || Number.isNaN(parsedQuantity) || parsedQuantity <= 0) return;

    onSave({
      name: name.trim(),
      quantity: parsedQuantity,
      unit: unit || null,
      price: price ? Number(price.replace(',', '.')) : null,
      category_id: categoryId || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} autoFocus />

      <div className="flex gap-2">
        <Input
          label="Menge"
          type="number"
          inputMode="decimal"
          step="0.001"
          min="0.001"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="flex-1"
        />
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Einheit</label>
          <select
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="min-h-[44px] rounded-xl border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <option value="">Keine Einheit</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Preis pro Einheit (€)"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Kategorie</label>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="min-h-[44px] rounded-xl border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">Ohne Kategorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={submitting}>
        Speichern
      </Button>
      <Button type="button" variant="danger" onClick={onDelete}>
        Artikel löschen
      </Button>
    </form>
  );
}
