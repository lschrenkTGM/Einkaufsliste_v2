import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { usernameToFakeEmail } from '@/lib/validation';
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth';
import type { Profile } from '@/types/db';
import type { Session, User } from '@supabase/supabase-js';

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) {
    console.error('Profil konnte nicht geladen werden', error);
    return null;
  }
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        setProfile(await fetchProfile(data.session.user.id));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setProfile(await fetchProfile(newSession.user.id));
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    const email = usernameToFakeEmail(username);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.toLowerCase() } },
    });
    if (error) {
      if (/already registered/i.test(error.message)) {
        throw new Error('Username ist schon vergeben');
      }
      throw error;
    }
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const email = usernameToFakeEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (/invalid login credentials/i.test(error.message)) {
        throw new Error('Username oder PIN ist falsch');
      }
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      if (!user) throw new Error('Nicht eingeloggt');
      const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
      if (error) throw error;
      setProfile((current) => (current ? { ...current, display_name: displayName } : current));
    },
    [user],
  );

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const value: AuthContextValue = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateDisplayName,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
