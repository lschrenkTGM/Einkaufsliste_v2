/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: {
          DEFAULT: 'rgb(var(--color-paper) / <alpha-value>)',
          raised: 'rgb(var(--color-paper-raised) / <alpha-value>)',
          sunken: 'rgb(var(--color-paper-sunken) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)',
        },
        line: 'rgb(var(--color-border) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          strong: 'rgb(var(--color-primary-strong) / <alpha-value>)',
          soft: 'rgb(var(--color-primary-soft) / <alpha-value>)',
          ink: 'rgb(var(--color-primary-ink) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          strong: 'rgb(var(--color-accent-strong) / <alpha-value>)',
          soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          strong: 'rgb(var(--color-danger-strong) / <alpha-value>)',
          soft: 'rgb(var(--color-danger-soft) / <alpha-value>)',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--color-ink) / 0.04), 0 2px 8px rgb(var(--color-ink) / 0.06)',
        lifted: '0 4px 12px rgb(var(--color-ink) / 0.08), 0 12px 32px rgb(var(--color-ink) / 0.10)',
        sheet: '0 -8px 40px rgb(var(--color-ink) / 0.18)',
        ring: '0 0 0 3px rgb(var(--color-primary) / 0.22)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-in': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'sheet-in': 'sheet-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
