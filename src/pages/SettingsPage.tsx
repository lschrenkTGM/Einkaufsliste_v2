import { useState, type FormEvent } from 'react';
import { LogOut, Share2, Smartphone, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { del } from 'idb-keyval';
import { Header } from '@/components/layout/Header';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, type ThemePreference } from '@/hooks/useTheme';
import { useShowCompletedSeparately } from '@/hooks/useShowCompletedSeparately';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { displayNameSchema, pinSchema } from '@/lib/validation';
import { APP_VERSION } from '@/lib/constants';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { profile, signOut, updateDisplayName, updatePassword } = useAuth();
  const { showCompletedSeparately, setShowCompletedSeparately } = useShowCompletedSeparately();
  const { canInstall, isIos, promptInstall } = usePwaInstall();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [displayNameError, setDisplayNameError] = useState<string>();
  const [savingName, setSavingName] = useState(false);

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [oldPinError, setOldPinError] = useState<string>();
  const [pinError, setPinError] = useState<string>();
  const [savingPin, setSavingPin] = useState(false);

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

  async function handlePinSubmit(event: FormEvent) {
    event.preventDefault();
    const oldResult = pinSchema.safeParse(oldPin);
    const newResult = pinSchema.safeParse(newPin);
    setOldPinError(oldResult.success ? undefined : oldResult.error.issues[0]?.message);
    setPinError(newResult.success ? undefined : newResult.error.issues[0]?.message);
    if (!oldResult.success || !newResult.success) return;

    setSavingPin(true);
    try {
      await updatePassword(newResult.data, oldResult.data);
      setOldPin('');
      setNewPin('');
      showToast({ message: 'PIN geändert', tone: 'success' });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'PIN konnte nicht geändert werden';
      showToast({ message, tone: 'error' });
    } finally {
      setSavingPin(false);
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

  async function handleInstall() {
    try {
      await promptInstall();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleClearLocalData() {
    if (!window.confirm('Lokale Daten löschen? Offline gespeicherte Listen werden entfernt.')) return;
    try {
      queryClient.clear();
      await del('einkaufsliste-query-cache');
      showToast({ message: 'Lokale Daten gelöscht', tone: 'success' });
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast({ message: 'Löschen fehlgeschlagen', tone: 'error' });
    }
  }

  return (
    <AppShell>
      <Header title="Einstellungen" />
      <div className="flex flex-col gap-8 p-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink-muted">Profil</h2>
          <p className="text-sm text-ink-faint">Username: {profile?.username ?? '–'}</p>
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
          <h2 className="text-sm font-semibold text-ink-muted">PIN ändern</h2>
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-2">
            <Input
              label="Aktueller PIN"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="current-password"
              value={oldPin}
              onChange={(event) => setOldPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
              error={oldPinError}
            />
            <Input
              label="Neuer PIN (6 Ziffern)"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="new-password"
              value={newPin}
              onChange={(event) => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
              error={pinError}
            />
            <Button type="submit" variant="secondary" disabled={savingPin}>
              PIN speichern
            </Button>
          </form>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink-muted">Design</h2>
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
          <h2 className="text-sm font-semibold text-ink-muted">Listenansicht</h2>
          <label className="flex items-center justify-between rounded-xl border border-line px-3 py-2">
            <span className="text-sm text-ink">
              Erledigte separat anzeigen
            </span>
            <input
              type="checkbox"
              checked={showCompletedSeparately}
              onChange={(event) => setShowCompletedSeparately(event.target.checked)}
              className="h-5 w-5 accent-primary"
            />
          </label>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink-muted">App</h2>
          {canInstall && (
            <Button variant="secondary" onClick={handleInstall}>
              <Smartphone size={18} /> App installieren
            </Button>
          )}
          {!canInstall && isIos && (
            <p className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-ink-muted">
              <Share2 size={16} /> Teilen → Zum Home-Bildschirm
            </p>
          )}
          <Button variant="secondary" onClick={handleClearLocalData}>
            <Trash2 size={18} /> Lokale Daten löschen
          </Button>
          <p className="text-xs text-ink-faint">Version {APP_VERSION}</p>
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
