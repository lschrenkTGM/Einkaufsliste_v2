import { useCallback, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastContext, type ToastOptions, type ToastTone } from './ToastContext';

interface ToastItem extends ToastOptions {
  id: number;
}

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 size={18} className="text-primary" />,
  error: <AlertCircle size={18} className="text-danger-strong" />,
  info: <Info size={18} className="text-accent" />,
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, ...options }]);
      window.setTimeout(() => dismiss(id), options.durationMs ?? 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-rise-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-ink/10 bg-ink px-4 py-3 text-sm text-paper shadow-lifted"
          >
            {toneIcon[toast.tone ?? 'info']}
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                className="font-semibold text-accent-strong"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
