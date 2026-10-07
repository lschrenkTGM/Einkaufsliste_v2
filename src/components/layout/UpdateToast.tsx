import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@/components/ui/ToastContext';

export function UpdateToast() {
  const { showToast } = useToast();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;
    showToast({
      message: 'Neue Version verfügbar',
      tone: 'info',
      durationMs: 15000,
      action: { label: 'Neu laden', onClick: () => updateServiceWorker(true) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needRefresh]);

  return null;
}
