export const UNITS = ['Stk', 'kg', 'g', 'l', 'ml', 'Pkg', 'Dose', 'Fl.', 'Bund', 'Netz'] as const;

export type Unit = (typeof UNITS)[number];

export const DEFAULT_CATEGORIES = [
  { name: 'Obst & Gemüse', emoji: '🥦', sort_order: 10 },
  { name: 'Brot & Gebäck', emoji: '🥖', sort_order: 20 },
  { name: 'Milch & Eier', emoji: '🥛', sort_order: 30 },
  { name: 'Fleisch & Fisch', emoji: '🥩', sort_order: 40 },
  { name: 'Tiefkühl', emoji: '🧊', sort_order: 50 },
  { name: 'Getränke', emoji: '🥤', sort_order: 60 },
  { name: 'Snacks & Süßes', emoji: '🍫', sort_order: 70 },
  { name: 'Haushalt & Drogerie', emoji: '🧴', sort_order: 80 },
  { name: 'Sonstiges', emoji: '📦', sort_order: 999 },
] as const;

export const LIST_EMOJIS = [
  '🛒', '🛍️', '🏠', '🥦', '🍞', '🥛', '🍖', '🧊', '🥤', '🍫',
  '🧴', '🔨', '🐾', '👶', '💊', '🎉', '🎂', '🧰', '🚗', '📦',
] as const;

export const FAKE_EMAIL_DOMAIN = 'einkaufsliste.app';
