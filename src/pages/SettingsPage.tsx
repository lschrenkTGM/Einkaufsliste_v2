import { useState, type FormEvent } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, type ThemePreference } from '@/hooks/useTheme';
import { displayNameSchema, passwordSchema } from '@/lib/validation';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { profile, signOut, updateDisplayName, updatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [displayNameError, setDisplayNameError] = useState<string>();
  const [savingName, setSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleDisplayNameSubmit(event: FormEvent) {
    event.preventDefault();
    const result = displayNameSchema.safeParse(displayName.trim());
    setDisplayNameError(result.success ? undefined : result.error.issues[0]?.message);
    if (!result.success) return;

    setSavingName(true);
    try {
      await updateDisplayName(result.data);
      showToast({ message: 'Anzeigename gespeichert', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Anzeigename konnte nicht gespeichert werden', tone: 'error' });
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    const result = passwordSchema.safeParse(newPassword);
    setPasswordError(result.success ? undefined : result.error.issues[0]?.message);
    if (!result.success) return;

    setSavingPassword(true);
    try {
      await updatePassword(result.data);
      setNewPassword('');
      showToast({ message: 'Passwort geändert', tone: 'success' });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Passwort konnte nicht geändert werden', tone: 'error' });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error(error);
      showToast({ message: 'Logout fehlgeschlagen', tone: 'error' });
    }
  }

  return (
    <AppShell>
      <Header title="Einstellungen" />
      <div className="flex flex-col gap-8 p-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Profil</h2>
          <p className="text-sm text-neutral-400">Username: {profile?.username ?? '–'}</p>
          <form onSubmit={handleDisplayNameSubmit} className="flex flex-col gap-2">
            <Input
              label="Anzeigename"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              error={displayNameError}
            />
            <Button type="submit" variant="secondary" disabled={savingName}>
              Speichern
            </Button>
          </form>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Passwort ändern</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-2">
            <Input
              label="Neues Passwort"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              error={passwordError}
            />
            <Button type="submit" variant="secondary" disabled={savingPassword}>
              Passwort speichern
            </Button>
          </form>
        </section>

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

        <section className="flex flex-col gap-2">
          <Button variant="danger" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
