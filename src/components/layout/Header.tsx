import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  actions?: ReactNode;
}

export function Header({ title, showBack, actions }: HeaderProps) {
  const navigate = useNavigate();

  // navigate(-1) tut nichts, wenn die Seite direkt geöffnet wurde (PWA-Start,
  // Reload, geteilter Link) – dann gibt es keinen App-internen Verlauf.
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/', { replace: true });
  };

  return (
    <header className="safe-top sticky top-0 z-30 flex h-16 items-center gap-1 border-b border-line bg-paper/90 px-2 backdrop-blur-md">
      {showBack && (
        <button
          onClick={goBack}
          aria-label="Zurück"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="font-display flex-1 truncate text-xl text-ink">{title}</h1>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}
