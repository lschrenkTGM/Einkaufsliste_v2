import { ListChecks, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Listen', icon: ListChecks },
  { to: '/settings', label: 'Einstellungen', icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-30 flex border-t border-line bg-paper/90 backdrop-blur-md">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-ink-faint hover:text-ink-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden="true" />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
