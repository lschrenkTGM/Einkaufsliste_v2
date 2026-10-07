import { useCallback, useEffect, useState } from 'react';

export type FontScale = 'sm' | 'md' | 'lg' | 'xl';

const STORAGE_KEY = 'einkaufsliste:fontScale';

const SCALE_VALUES: Record<FontScale, number> = {
  sm: 0.9375,
  md: 1,
  lg: 1.125,
  xl: 1.25,
};

function readStored(): FontScale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'sm' || stored === 'md' || stored === 'lg' || stored === 'xl') return stored;
  return 'md';
}

export function useFontScale() {
  const [scale, setScaleState] = useState<FontScale>(readStored);

  useEffect(() => {
    document.documentElement.style.fontSize = `${SCALE_VALUES[scale] * 16}px`;
    localStorage.setItem(STORAGE_KEY, scale);
  }, [scale]);

  const setScale = useCallback((value: FontScale) => setScaleState(value), []);

  return { scale, setScale };
}
