import { useEffect, useState, type FormEvent } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { passwordSchema, usernameSchema } from '@/lib/validation';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
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
    const passwordResult = passwordSchema.safeParse(password);
    setUsernameError(usernameResult.success ? undefined : usernameResult.error.issues[0]?.message);
    setPasswordError(passwordResult.success ? undefined : passwordResult.error.issues[0]?.message);
    if (!usernameResult.success || !passwordResult.success) return;

    setSubmitting(true);
    try {
      if (mode === 'register') {
        await signUp(normalizedUsername, password);
        showToast({ message: 'Account erstellt! Du bist eingeloggt.', tone: 'success' });
      } else {
        await signIn(normalizedUsername, password);
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
          label="Passwort"
          name="password"
          type="password"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
        />

        {mode === 'register' && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Merk dir dein Passwort gut, es gibt keine Wiederherstellung.
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
