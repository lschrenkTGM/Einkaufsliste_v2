import { useCallback, useEffect, useState } from 'react';

export type DesignTheme = 'clean' | 'glass';

const STORAGE_KEY = 'einkaufsliste:design';

function readStored(): DesignTheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'glass' ? 'glass' : 'clean';
}

export function useDesignTheme() {
  const [design, setDesignState] = useState<DesignTheme>(readStored);

  useEffect(() => {
    document.documentElement.setAttribute('data-design', design);
    localStorage.setItem(STORAGE_KEY, design);
  }, [design]);

  const setDesign = useCallback((value: DesignTheme) => setDesignState(value), []);

  return { design, setDesign };
}
