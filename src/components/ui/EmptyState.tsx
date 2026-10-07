import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-rise-in flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          {icon}
        </div>
      )}
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="max-w-xs text-sm leading-relaxed text-ink-muted">{description}</p>}
      {action}
    </div>
  );
}
