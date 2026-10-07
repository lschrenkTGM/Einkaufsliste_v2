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

  return (
    <header className="safe-top sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-neutral-200 bg-white/90 px-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Zurück"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 truncate text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}
