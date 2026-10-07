import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'warning';
}

const toneClasses: Record<Required<BadgeProps>['tone'], string> = {
  neutral: 'bg-paper-sunken text-ink-muted',
  primary: 'bg-primary-soft text-primary',
  warning: 'bg-accent-soft text-accent-strong',
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
