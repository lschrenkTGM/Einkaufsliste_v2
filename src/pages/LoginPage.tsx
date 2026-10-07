import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, ShoppingBasket } from 'lucide-react';
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

  const { profile, signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    if (profile) {
      navigate(redirectTo, { replace: true });
    }
  }, [profile, navigate, redirectTo]);

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-soft blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-accent-soft blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-sm flex-col items-center">
        <div className="animate-rise-in flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 rotate-[-6deg] items-center justify-center rounded-3xl bg-primary text-primary-ink shadow-lifted">
            <ShoppingBasket size={30} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-display text-4xl italic leading-none text-ink">Einkaufsliste</h1>
            <p className="mt-2 text-sm text-ink-muted">Gemeinsam einkaufen, nie wieder vergessen.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-rise-in mt-10 flex w-full flex-col gap-4 rounded-3xl border border-line bg-paper-raised p-6 shadow-soft"
          style={{ animationDelay: '80ms' }}
        >
          <Input
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={usernameError}
          />
          <Input
            label="PIN (6 Ziffern)"
            name="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
            error={pinError}
          />

          {mode === 'register' && (
            <p className="-mt-1 text-xs leading-relaxed text-ink-faint">
              Merk dir deinen PIN gut, es gibt keine Wiederherstellung.
            </p>
          )}

          <Button type="submit" disabled={submitting} className="mt-1 w-full">
            {mode === 'register' ? 'Account erstellen' : 'Einloggen'}
            <ArrowRight size={16} />
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
          className="animate-rise-in mt-6 text-sm font-medium text-ink-muted transition-colors hover:text-primary"
          style={{ animationDelay: '140ms' }}
        >
          {mode === 'register' ? 'Schon registriert? ' : 'Noch keinen Account? '}
          <span className="text-primary">{mode === 'register' ? 'Einloggen' : 'Registrieren'}</span>
        </button>
      </div>
    </div>
  );
}
