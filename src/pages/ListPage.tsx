import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ListChecks, MoreVertical } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AppShell } from '@/components/layout/AppShell';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastContext';
import { CategorySection } from '@/components/items/CategorySection';
import { TotalBar } from '@/components/items/TotalBar';
import { QuickAddBar } from '@/components/items/QuickAddBar';
import { ItemForm } from '@/components/items/ItemForm';
import { ManageCategories } from '@/components/items/ManageCategories';
import { useList } from '@/hooks/useLists';
import { useCategories, useCategoryMutations } from '@/hooks/useCategories';
import { useItems, useItemMutations } from '@/hooks/useItems';
import { useShowCompletedSeparately } from '@/hooks/useShowCompletedSeparately';
import type { Category, Item } from '@/types/db';

function sortForDisplay(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return a.created_at.localeCompare(b.created_at);
  });
}

export default function ListPage() {
  const { id } = useParams<{ id: string }>();
  const { data: list } = useList(id);
  const { data: categories = [] } = useCategories(id);
  const { data: items = [] } = useItems(id);
  const { addCategory, updateCategory, deleteCategory } = useCategoryMutations(id);
  const { addItem, updateItem, toggleChecked, deleteItem, deleteChecked, resetAllChecked } =
    useItemMutations(id);
  const { showCompletedSeparately } = useShowCompletedSeparately();
  const { showToast } = useToast();

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort_order - b.sort_order),
    [categories],
  );

  const { total, openTotal, itemsWithoutPrice } = useMemo(() => {
    let total = 0;
    let openTotal = 0;
    let withoutPrice = 0;
    for (const item of items) {
      if (item.price == null) {
        withoutPrice += 1;
        continue;
      }
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      if (!item.checked) openTotal += lineTotal;
    }
    return { total, openTotal, itemsWithoutPrice: withoutPrice };
  }, [items]);

  function itemsForCategory(categoryId: string | null) {
    const group = items.filter((item) => item.category_id === categoryId);
    const visible = showCompletedSeparately ? group.filter((item) => !item.checked) : group;
    return sortForDisplay(visible);
  }

  const completedItems = useMemo(
    () =>
      showCompletedSeparately
        ? [...items.filter((item) => item.checked)].sort((a, b) =>
            (b.checked_at ?? '').localeCompare(a.checked_at ?? ''),
          )
        : [],
    [items, showCompletedSeparately],
  );

  async function handleToggle(item: Item) {
    try {
      await toggleChecked.mutateAsync({ id: item.id, checked: !item.checked });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Konnte nicht aktualisiert werden', tone: 'error' });
    }
  }

  async function handleQuantityChange(item: Item, nextQuantity: number) {
    try {
      await updateItem.mutateAsync({ id: item.id, quantity: Math.round(nextQuantity * 1000) / 1000 });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Menge konnte nicht geändert werden', tone: 'error' });
    }
  }

  async function handleSaveItem(fields: {
    name: string;
    quantity: number;
    unit: string | null;
    price: number | null;
    category_id: string | null;
  }) {
    if (!editingItem) return;
    try {
      await updateItem.mutateAsync({ id: editingItem.id, ...fields });
      setEditingItem(null);
    } catch (error) {
      console.error(error);
      showToast({ message: 'Artikel konnte nicht gespeichert werden', tone: 'error' });
    }
  }

  async function handleDeleteItem() {
    if (!editingItem) return;
    try {
      await deleteItem.mutateAsync(editingItem.id);
      setEditingItem(null);
    } catch (error) {
      console.error(error);
      showToast({ message: 'Artikel konnte nicht gelöscht werden', tone: 'error' });
    }
  }

  async function handleAddCategory(name: string, emoji: string) {
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0);
    try {
      await addCategory.mutateAsync({ name, emoji, sortOrder: maxOrder + 10 });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Kategorie konnte nicht erstellt werden', tone: 'error' });
    }
  }

  async function handleMoveCategory(category: Category, direction: 'up' | 'down') {
    const idx = sortedCategories.findIndex((c) => c.id === category.id);
    const swapWith = direction === 'up' ? sortedCategories[idx - 1] : sortedCategories[idx + 1];
    if (!swapWith) return;
    try {
      await Promise.all([
        updateCategory.mutateAsync({ id: category.id, sort_order: swapWith.sort_order }),
        updateCategory.mutateAsync({ id: swapWith.id, sort_order: category.sort_order }),
      ]);
    } catch (error) {
      console.error(error);
      showToast({ message: 'Reihenfolge konnte nicht geändert werden', tone: 'error' });
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (!window.confirm(`Kategorie "${category.name}" löschen? Artikel werden zu "Ohne Kategorie".`)) return;
    try {
      await deleteCategory.mutateAsync(category.id);
    } catch (error) {
      console.error(error);
      showToast({ message: 'Kategorie konnte nicht gelöscht werden', tone: 'error' });
    }
  }

  async function handleDeleteChecked() {
    setMenuOpen(false);
    try {
      await deleteChecked.mutateAsync();
      showToast({ message: 'Erledigte Artikel gelöscht', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Löschen fehlgeschlagen', tone: 'error' });
    }
  }

  async function handleResetAll() {
    setMenuOpen(false);
    try {
      await resetAllChecked.mutateAsync();
      showToast({ message: 'Alle Artikel zurückgesetzt', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Zurücksetzen fehlgeschlagen', tone: 'error' });
    }
  }

  const hasAnyItems = items.length > 0;

  return (
    <AppShell showBottomNav={false}>
      <Header
        title={list ? `${list.emoji} ${list.name}` : 'Liste'}
        showBack
        actions={
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menü"
            className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <MoreVertical size={20} />
          </button>
        }
      />

      <div className="pb-40">
        {!hasAnyItems && (
          <EmptyState
            icon={<ListChecks size={40} />}
            title="Noch keine Artikel"
            description="Füge unten den ersten Artikel hinzu, z.B. „2 kg Äpfel“."
          />
        )}

        {sortedCategories.map((category) => (
          <CategorySection
            key={category.id}
            title={category.name}
            emoji={category.emoji ?? '📦'}
            items={itemsForCategory(category.id)}
            onToggle={handleToggle}
            onEdit={setEditingItem}
            onQuantityChange={handleQuantityChange}
          />
        ))}

        <CategorySection
          title="Ohne Kategorie"
          emoji="📦"
          items={itemsForCategory(null)}
          onToggle={handleToggle}
          onEdit={setEditingItem}
          onQuantityChange={handleQuantityChange}
        />

        {showCompletedSeparately && completedItems.length > 0 && (
          <CategorySection
            title="Erledigt"
            emoji="✅"
            items={completedItems}
            onToggle={handleToggle}
            onEdit={setEditingItem}
            onQuantityChange={handleQuantityChange}
            defaultCollapsed
          />
        )}
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-[640px] border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <TotalBar total={total} openTotal={openTotal} itemsWithoutPrice={itemsWithoutPrice} />
        <QuickAddBar items={items} onAdd={(input) => addItem.mutate(input)} />
      </div>

      <Sheet open={!!editingItem} onClose={() => setEditingItem(null)} title="Artikel bearbeiten">
        {editingItem && (
          <ItemForm
            item={editingItem}
            categories={sortedCategories}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
            submitting={updateItem.isPending}
          />
        )}
      </Sheet>

      <Sheet open={manageCategoriesOpen} onClose={() => setManageCategoriesOpen(false)} title="Kategorien verwalten">
        <ManageCategories
          categories={sortedCategories}
          onAdd={handleAddCategory}
          onMove={handleMoveCategory}
          onDelete={handleDeleteCategory}
        />
      </Sheet>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Liste">
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={handleDeleteChecked}>
            Erledigte löschen
          </Button>
          <Button variant="secondary" onClick={handleResetAll}>
            Alle zurücksetzen
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setMenuOpen(false);
              setManageCategoriesOpen(true);
            }}
          >
            Kategorien verwalten
          </Button>
        </div>
      </Sheet>
    </AppShell>
  );
}
