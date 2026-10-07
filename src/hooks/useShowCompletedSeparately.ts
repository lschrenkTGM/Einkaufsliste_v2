import { useCallback, useState } from 'react';

const STORAGE_KEY = 'einkaufsliste:showCompletedSeparately';

function readStored(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

export function useShowCompletedSeparately() {
  const [value, setValue] = useState(readStored);

  const setShowCompletedSeparately = useCallback((next: boolean) => {
    setValue(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  return { showCompletedSeparately: value, setShowCompletedSeparately };
}
