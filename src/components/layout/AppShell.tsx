import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from './OfflineBanner';

interface AppShellProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function AppShell({ children, showBottomNav = true }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col md:border-x md:border-line">
      <div className="sticky top-0 z-40">
        <OfflineBanner />
      </div>
      <div className="flex-1">{children}</div>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
