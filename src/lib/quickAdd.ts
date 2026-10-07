import { UNITS } from './constants';

export interface ParsedQuickAdd {
  quantity: number;
  unit: string | null;
  explicitUnit: boolean;
  name: string;
}

export function parseQuickAdd(input: string): ParsedQuickAdd | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  const first = parts[0].replace(',', '.');
  const asNumber = Number(first);

  if (parts.length >= 2 && !Number.isNaN(asNumber) && asNumber > 0) {
    const second = parts[1];
    const matchedUnit = UNITS.find((unit) => unit.toLowerCase() === second.toLowerCase());

    if (matchedUnit) {
      const name = parts.slice(2).join(' ').trim();
      if (!name) return null;
      return { quantity: asNumber, unit: matchedUnit, explicitUnit: true, name };
    }

    const name = parts.slice(1).join(' ').trim();
    if (!name) return null;
    return { quantity: asNumber, unit: 'Stk', explicitUnit: true, name };
  }

  return { quantity: 1, unit: null, explicitUnit: false, name: trimmed };
}
