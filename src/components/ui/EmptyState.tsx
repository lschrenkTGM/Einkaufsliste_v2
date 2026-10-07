import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon && <div className="text-neutral-400 dark:text-neutral-500">{icon}</div>}
      <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
      {action}
    </div>
  );
}
