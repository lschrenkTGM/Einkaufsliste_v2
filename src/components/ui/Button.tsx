import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-ink shadow-soft hover:bg-primary-strong hover:shadow-lifted active:scale-[0.97]',
  accent:
    'bg-accent text-primary-ink shadow-soft hover:bg-accent-strong hover:shadow-lifted active:scale-[0.97]',
  secondary:
    'bg-paper-raised text-ink border border-line hover:border-ink-faint hover:bg-paper-sunken active:scale-[0.97]',
  ghost: 'bg-transparent text-ink-muted hover:bg-paper-sunken hover:text-ink active:scale-[0.97]',
  danger:
    'bg-danger-soft text-danger-strong hover:bg-danger hover:text-primary-ink active:scale-[0.97]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
