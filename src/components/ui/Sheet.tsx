import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="safe-bottom animate-sheet-in md:animate-scale-in relative max-h-[88vh] w-full max-w-[640px] overflow-y-auto rounded-t-3xl border-t border-line bg-paper-raised p-5 shadow-sheet md:rounded-3xl md:border">
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="font-display text-xl text-ink">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
