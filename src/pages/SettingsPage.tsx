import { Header } from '@/components/layout/Header';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useTheme, type ThemePreference } from '@/hooks/useTheme';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppShell>
      <Header title="Einstellungen" />
      <div className="flex flex-col gap-6 p-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Design</h2>
          <div className="flex gap-2">
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                variant={theme === option.value ? 'primary' : 'secondary'}
                onClick={() => setTheme(option.value)}
                className="flex-1"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
