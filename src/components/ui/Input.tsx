import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`min-h-[46px] rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-base text-ink placeholder:text-ink-faint transition-colors duration-150 focus:border-primary focus:outline-none focus:shadow-ring ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
