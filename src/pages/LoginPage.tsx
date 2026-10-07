import { useEffect, useState, type FormEvent } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { pinSchema, usernameSchema } from '@/lib/validation';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [usernameError, setUsernameError] = useState<string>();
  const [pinError, setPinError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const { session, loading, signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    if (!loading && session) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, session, navigate, redirectTo]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();

    const usernameResult = usernameSchema.safeParse(normalizedUsername);
    const pinResult = pinSchema.safeParse(pin);
    setUsernameError(usernameResult.success ? undefined : usernameResult.error.issues[0]?.message);
    setPinError(pinResult.success ? undefined : pinResult.error.issues[0]?.message);
    if (!usernameResult.success || !pinResult.success) return;

    setSubmitting(true);
    try {
      if (mode === 'register') {
        await signUp(normalizedUsername, pin);
        showToast({ message: 'Account erstellt! Du bist eingeloggt.', tone: 'success' });
      } else {
        await signIn(normalizedUsername, pin);
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      showToast({ message, tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <ShoppingCart size={40} className="text-primary-600" />
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Einkaufsliste</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <Input
          label="Username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={usernameError}
        />
        <Input
          label="PIN (4 Ziffern)"
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
          error={pinError}
        />

        {mode === 'register' && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Merk dir deinen PIN gut, es gibt keine Wiederherstellung.
          </p>
        )}

        <Button type="submit" disabled={submitting}>
          {mode === 'register' ? 'Account erstellen' : 'Einloggen'}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
        className="text-sm text-primary-600 dark:text-primary-400"
      >
        {mode === 'register' ? 'Schon registriert? Einloggen' : 'Noch keinen Account? Registrieren'}
      </button>
    </div>
  );
}
